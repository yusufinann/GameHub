import { useState, useEffect, useCallback, useMemo } from "react"; // Add useCallback
import { useParams, useNavigate } from "react-router-dom";
import { fetchLobbyDetails} from "./api"; 
import { joinLobby } from "../MainScreen/MainScreenMiddleArea/LobbiesArea/api";
import { useLobbyContext } from "../../shared/context/LobbyContext/context";

export const useGameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { membersByLobby, setMembersByLobby } = useLobbyContext();
  const [lobbyDetails, setLobbyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser?.id;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleJoin = useCallback(async (password = "") => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication token not found."); 
    }
    if (!link) {
        throw new Error("Lobby code (link) is missing."); 
    }

    try {
      const joinResponse = await joinLobby(link, password);

      if (joinResponse) {
        const updatedLobbyResponse = await fetchLobbyDetails(link, token);

        if (updatedLobbyResponse.data.lobby) {
          const updatedLobby = updatedLobbyResponse.data.lobby;
          setLobbyDetails(updatedLobby); 

          setMembersByLobby(prev => ({
            ...prev,
            [updatedLobby.lobbyCode]: (updatedLobby.members || []).map(member => ({
              id: member.id,
              name: member.name,
              avatar: member.avatar,
              isHost: member.id === updatedLobby.createdBy,
              isReady: false, 
            }))
          }));

          setIsPasswordModalOpen(false);
          return joinResponse; 
        } else {
            throw new Error("Failed to fetch updated lobby details after joining.");
        }
      } else {
          throw new Error("Join request did not return a successful response.");
      }
    } catch (error) {
      console.error("Join error:", error);
      throw error;
    }
  }, [link, setMembersByLobby]); 

  useEffect(() => {
    let isMounted = true; 
    const getLobbyDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetchLobbyDetails(link, token);

        if (isMounted && response.status === 200) {
          const lobby = response.data.lobby;
          lobby.members = lobby.members || [];
          setLobbyDetails(lobby); 

          const userIsMember = lobby.members.some((member) => member.id === userId);

          if (!userIsMember) {
            setIsPasswordModalOpen(true);
          } else {
            setMembersByLobby(prev => ({
              ...prev,
              [lobby.lobbyCode]: lobby.members.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar,
                isHost: member.id === lobby.createdBy,
                isReady: prev[lobby.lobbyCode]?.find(m => m.id === member.id)?.isReady || false, 
              }))
            }));
          }
        } else if (isMounted) {
            setError(`Failed to fetch lobby details: Status ${response.status}`);
             navigate("/");
        }
      } catch (error) {
         if (isMounted) {
            console.error("Error fetching lobby details:", error);
            if (error.response) {
              switch (error.response.status) {
                case 400:
                  setError("Invalid request. Please check the lobby code.");
                  break;
                case 404:
                  setError(`Lobby with code "${link}" not found.`);
                  navigate("/"); 
                  break;
                default:
                   setError(`An error occurred (${error.response.status}). Please try again later.`);
                  break;
              }
            } else if (error.request) {
              setError("Unable to connect to the server. Please check your internet connection.");
            } else {
              setError("An error occurred: " + error.message);
            }
         }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (link && userId) { 
        getLobbyDetails();
    } else if (!userId) {
        setError("User information not found. Please log in.");
        setLoading(false);
    } else {
        setError("Lobby link parameter is missing.");
        setLoading(false);
        navigate("/");
    }


    return () => {
        isMounted = false; 
    };

  }, [link, userId, setMembersByLobby, navigate]); 

  const handlePasswordModalClose = useCallback(() => {
    setIsPasswordModalOpen(false);
    if (lobbyDetails && !lobbyDetails.members.some(member => member.id === userId.toString())) {
      console.log(userId)
      navigate("/");
    }
  }, [lobbyDetails, userId, navigate]);

  const members = useMemo(() => {
    return membersByLobby[link] || [];
  }, [membersByLobby, link]); 
  return {
    lobbyDetails,
    loading,
    error,
    setError,
    members,
    userId,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    handleJoin,
    handlePasswordModalClose 
  };
};


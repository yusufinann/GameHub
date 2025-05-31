import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLobbyDetails } from "./api";
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

          const userIsMember = lobby.members.some(
            (member) => String(member.id) === String(userId)
          );

          if (!userIsMember) {
            setIsPasswordModalOpen(true);
          } else {
            setMembersByLobby(prev => ({
              ...prev,
              [lobby.lobbyCode]: lobby.members.map(member => ({
                id: String(member.id),
                name: member.name,
                avatar: member.avatar,
                isHost: String(member.id) === String(lobby.createdBy),
                isReady: prev[lobby.lobbyCode]?.find(m => String(m.id) === String(member.id))?.isReady || false,
              }))
            }));
            setIsPasswordModalOpen(false);
          }
        } else if (isMounted) {
          setError(`Failed to fetch lobby details: Status ${response.status}`);
          if (response.status !== 401) navigate("/");
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
              case 401:
                setError("Authentication error. Please log in again.");
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
      navigate("/login");
    } else {
      setError("Lobby link parameter is missing.");
      setLoading(false);
      navigate("/");
    }

    return () => {
      isMounted = false;
    };
  }, [link, userId, setMembersByLobby, navigate]);

  const members = useMemo(() => {
    const currentLobbyMembers = membersByLobby[link] || lobbyDetails?.members || [];
    return currentLobbyMembers.map(m => ({
        ...m,
        id: String(m.id),
        isHost: String(m.id) === String(lobbyDetails?.createdBy)
    }));
  }, [membersByLobby, link, lobbyDetails]);

  const isMember = useMemo(() => {
    if (!lobbyDetails || !userId) return false;
    return members.some(member => String(member.id) === String(userId));
  }, [members, userId, lobbyDetails]);

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
              id: String(member.id),
              name: member.name,
              avatar: member.avatar,
              isHost: String(member.id) === String(updatedLobby.createdBy),
              isReady: prev[updatedLobby.lobbyCode]?.find(m => String(m.id) === String(member.id))?.isReady || false,
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

  const handlePasswordModalClose = useCallback(() => {
    setIsPasswordModalOpen(false);
    if (!isMember) {
        navigate("/");
    }
  }, [setIsPasswordModalOpen, navigate, isMember]);


  return {
    lobbyDetails,
    loading,
    error,
    setError,
    members,
    userId: String(userId),
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    handleJoin,
    handlePasswordModalClose,
    isMember
  };
};
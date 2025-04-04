import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLobbyDetails} from "./api";
import { useLobbyContext } from "../MainScreen/MainScreenMiddleArea/context";
import { joinLobby } from "../MainScreen/MainScreenMiddleArea/LobbiesArea/api";

export const useGameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const {membersByLobby, setMembersByLobby } = useLobbyContext();
  const [lobbyDetails, setLobbyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser?.id;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const getLobbyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetchLobbyDetails(link, token);

        if (response.status === 200) {
          const lobby = response.data.lobby;
          const userIsMember = lobby.members?.some((member) => member.id === userId);

          if (!userIsMember) {
           setIsPasswordModalOpen(true);
           //navigate("/"); // Kullanıcı üye değilse ana sayfaya yönlendir
            return;
          }

          if (lobby.password && !userIsMember) {
            setLobbyDetails(lobby);
            return;
          }

          setLobbyDetails(lobby);

          setMembersByLobby(prev => ({
            ...prev,
            [lobby.lobbyCode]: lobby.members.map(member => ({
              id: member.id,
              name: member.name,
              avatar:member.avatar,
              isHost: member.id === lobby.createdBy,
              isReady: false,
            }))
          }));
        }
      }
        
       catch (error) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setError("Invalid request. Please check your input.");
              break;
            case 404:
              setError("Lobby not found.");
              navigate("/"); // Lobby bulunamazsa anasayfaya yönlendir
              break;
            default:
              setError("An error occurred. Please try again later.");
              break;
          }
        } else if (error.request) {
          setError("Unable to connect to the server. Please check your internet connection.");
        } else {
          setError("An error occurred: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    getLobbyDetails();
  }, [link, userId, setMembersByLobby, navigate]);

  const handleJoin = async (password = "") => {
    try {
      // Get token first
      const token = localStorage.getItem("token");

      // Join the lobby with password
      const joinResponse = await joinLobby(link, password);

      if (joinResponse) {
        const updatedLobby = await fetchLobbyDetails(link, token); 

        if (updatedLobby.data.lobby) {
          const lobby = updatedLobby.data.lobby;
          setLobbyDetails(lobby);

          setMembersByLobby(prev => ({
            ...prev,
            [lobby.lobbyCode]: lobby.members.map(member => ({
              id: member.id,
              name: member.name,
              avatar: member.avatar,
              isHost: member.id === lobby.createdBy,
              isReady: false,
            }))
          }));
        
          setIsPasswordModalOpen(false);
          return joinResponse;
        }
      }
    } catch (error) {
      console.error("Join error:", error);
      throw error;
    }
  };

  return {
    lobbyDetails,
    loading,
    error,
    setError,
    members: membersByLobby[link] || [],
    userId,
    isPasswordModalOpen,
    setIsPasswordModalOpen,handleJoin
  };
};
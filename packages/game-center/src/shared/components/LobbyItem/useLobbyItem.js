import { useState, useEffect } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../context/WebSocketContext/context";
import { getLobbyDetails, joinLobby } from "../../../pages/MainScreen/MainScreenMiddleArea/LobbiesArea/api";
import { useLobbyContext } from "../../context/LobbyContext/context";

export const useLobbyItem = (lobby, currentUser) => {
  const { 
    setMembersByLobby,
    deleteLobby, 
    setIsJoined,
    membersByLobby 
  } = useLobbyContext();
  
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [eventStatus, setEventStatus] = useState(null);
  const { socket } = useWebSocket();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);

      if (data.lobbyCode === lobby.lobbyCode) {
        switch (data.type) {
          case "EVENT_STATUS":
            setEventStatus(data.status);
            break;
          case "LOBBY_EXPIRED":
            showSnackbar({
              message: "Event time expired, lobby closed.",
              severity: "info",
            });
            break;
          default:
            console.warn("Unknown WebSocket message type:", data.type);
            break;
        }
      }
    };

    socket.addEventListener("message", handleWebSocketMessage);
    return () => socket.removeEventListener("message", handleWebSocketMessage);
  }, [socket, lobby.lobbyCode, setMembersByLobby, deleteLobby, navigate, showSnackbar]);

  const isMember = membersByLobby[lobby.lobbyCode]?.some(
    (member) => member.id === currentUser?.id
  );

  useEffect(() => {
    setIsJoined(isMember);
  }, [isMember, setIsJoined]);

  const handleJoin = async (password = "") => {
    setError("");
    setIsJoining(true);

    try {
      const joinResponse = await joinLobby(lobby.lobbyCode, password);
      const updatedLobby = await getLobbyDetails(lobby.lobbyCode);

      setMembersByLobby((prevState) => {
        const currentMembers = prevState[lobby.lobbyCode] || [];
        const isHost = updatedLobby.createdBy === currentUser.id;
       const existingMemberIndex = currentMembers.findIndex(
        (m) => m.id === currentUser.id
      );
   

      if (existingMemberIndex >= 0) {
        const updatedMembers = [...currentMembers];
        updatedMembers[existingMemberIndex] = {
          ...updatedMembers[existingMemberIndex],
          isHost,
        };
        return { ...prevState, [lobby.lobbyCode]: updatedMembers };
      } else {
        return {
          ...prevState,
          [lobby.lobbyCode]: [
            ...currentMembers,
            {
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              isHost,
            },
          ],
        };
      }
    });
      setIsJoined(true);
      navigate(`/lobby/${lobby.lobbyCode}`);

      showSnackbar({
        message: joinResponse.message || "Successfully joined the lobby.",
        severity: "success",
      });
    } catch (error) {
      setError(error.message || "Failed to join the lobby.");
      showSnackbar({
        message: error.message || "Failed to join the lobby.",
        severity: "error",
      });
      throw error;
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async (lobbyCode, event) => {
    if (event) {
      event.stopPropagation();
    }
    setIsDeleting(true);
    try {
      await deleteLobby(lobbyCode);

      showSnackbar({
        message: "Lobby successfully deleted.",
        severity: "success",
      });
      
    } catch (error) {
      console.error("Error deleting lobby:", error);

      showSnackbar({
        message: error.response?.data?.message || "An error occurred while deleting the lobby.",
        severity: "error",
      });
    }finally {
      setIsDeleting(false);
    }
  };

  return {
    isJoining,
    isMember,
    error,
    handleJoin,
    handleDelete,
    setError,
    eventStatus,
    isDeleting
  };
};
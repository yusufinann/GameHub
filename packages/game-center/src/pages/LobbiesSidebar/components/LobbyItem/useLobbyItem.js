import { useState, useEffect } from "react";
import { useSnackbar } from "../../../../shared/context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { useLobbyContext } from "../../../MainScreen/MainScreenMiddleArea/context";
import { getLobbyDetails, joinLobby } from "../../api";
import { useWebSocket } from "../../../../shared/context/WebSocketContext/context";

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

  // Tek bir useEffect içinde tüm WebSocket mesajlarını yönetiyoruz
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

          case "USER_JOINED":
            setMembersByLobby((prevState) => {
              const currentMembers = prevState[data.lobbyCode] || [];
              // Kullanıcı zaten varsa ekleme yapma
              if (!currentMembers.some((member) => member.id === data.data.userId)) {
                return {
                  ...prevState,
                  [data.lobbyCode]: [
                    ...currentMembers,
                    {
                      id: data.data.userId,
                      name: data.data.userName,
                      avatar: data.data.avatar,
                      isHost: false,
                    },
                  ],
                };
              }
              return prevState;
            });
            break;

          case "LOBBY_EXPIRED":
            showSnackbar({
              message: "Event time expired, lobby closed.",
              severity: "info",
            });
            navigate("/");
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

  // isMember kontrolü ve setIsJoined effect'i
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

      const membersInfo = updatedLobby.members.map((member) => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        isHost: member.id === updatedLobby.createdBy,
        isReady: false,
      }));

      setMembersByLobby((prevState) => ({
        ...prevState,
        [lobby.lobbyCode]: membersInfo,
      }));

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

    try {
      await deleteLobby(lobbyCode);

      showSnackbar({
        message: "Lobby successfully deleted.",
        severity: "success",
      });

      navigate("/");
    } catch (error) {
      console.error("Error deleting lobby:", error);

      showSnackbar({
        message: error.response?.data?.message || "An error occurred while deleting the lobby.",
        severity: "error",
      });
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
  };
};
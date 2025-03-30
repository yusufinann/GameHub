import { useState, useEffect } from "react";
import { useSnackbar } from "../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { useLobbyContext } from "../../pages/MainScreen/MainScreenMiddleArea/context";
import { useWebSocket } from "../context/WebSocketContext/context";
import { getLobbyDetails, joinLobby } from "../../pages/MainScreen/MainScreenMiddleArea/LobbiesArea/api";

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

  // Tek bir useEffect içinde tüm WebSocket mesajlarını yönetiyoruz
  useEffect(() => {
    if (!socket) return;

    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);

      if (data.lobbyCode === lobby.lobbyCode) {
        switch (data.type) {
          case "HOST_RETURNED":
          setEventStatus('active');
          break;
        case "HOST_LEAVE_TIMEOUT":
          setEventStatus('host_left');
          break;
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
       // Check and clear host leave timer if exists
    const hostLeaveTimer = localStorage.getItem(`hostLeaveTimer_${lobby.lobbyCode}`);

    if (hostLeaveTimer) {
      // Timer bilgisini temizle
      localStorage.removeItem(`hostLeaveTimer_${lobby.lobbyCode}`);
      
      // Sunucuya host geri döndü bilgisini gönder
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'HOST_RETURNED',
            lobbyCode: lobby.lobbyCode,
            userId: currentUser.id,
            userName: currentUser.name,
            avatar: currentUser.avatar
          })
        );
      }
    }
      const joinResponse = await joinLobby(lobby.lobbyCode, password);
      const updatedLobby = await getLobbyDetails(lobby.lobbyCode);

      // Hemen üye listesini güncelle
      setMembersByLobby((prevState) => {
        const currentMembers = prevState[lobby.lobbyCode] || [];
        const isHost = updatedLobby.createdBy === currentUser.id;
           // Kullanıcı zaten listede yoksa ekle
       // Add or update the user with isHost status
       const existingMemberIndex = currentMembers.findIndex(
        (m) => m.id === currentUser.id
      );
   

      if (existingMemberIndex >= 0) {
        // Update existing member
        const updatedMembers = [...currentMembers];
        updatedMembers[existingMemberIndex] = {
          ...updatedMembers[existingMemberIndex],
          isHost,
        };
        return { ...prevState, [lobby.lobbyCode]: updatedMembers };
      } else {
        // Add new member
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

      navigate("/");
    } catch (error) {
      console.error("Error deleting lobby:", error);

      showSnackbar({
        message: error.response?.data?.message || "An error occurred while deleting the lobby.",
        severity: "error",
      });
    }finally {
      setIsDeleting(false); // End deleting animation
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
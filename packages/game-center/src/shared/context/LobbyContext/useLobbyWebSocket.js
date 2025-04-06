import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useLobbyWebSocket = (
  socket,
  currentUser,
  setLobbies,
  existingLobby,
  setMembersByLobby,
  setExistingLobby,
  membersByLobby,
  setDeletedLobbyInfo
) => {
  const [isWebSocketUpdate, setIsWebSocketUpdate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket mesajı:", data);

      if (!data.type) {
        console.error("WebSocket mesajında type alanı eksik:", data);
        return;
      }

      setIsWebSocketUpdate(true);
      try {
        switch (data.type) {
          case "LOBBY_CREATED":
            handleLobbyCreated(data.data);
            break;
          case "USER_JOINED":
            handleUserJoined(data);
            break;
          case "USER_LEFT":
            handleUserLeft(data);
            break;
          case "LOBBY_DELETED":
            handleLobbyDeleted(data.lobbyCode, data.data);
            break;
          case "LOBBY_EXPIRED":
            handleLobbyExpired(data);
            break;
          case "EVENT_STATUS":
            handleEventStatus(data);
            break;
          case "HOST_RETURNED":
            handleHostReturned(data);
            break;
          case "LOBBY_REMOVED":
            handleLobbyRemoved(data.lobbyCode);
            break;
          case "LOBBY_UPDATED":
            handleLobbyUpdated(data.data);
            break;
          default:
            // console.warn("Bilinmeyen WebSocket mesaj türü:", data.type);
            break;
        }
      } finally {
        setIsWebSocketUpdate(false);
      }
    };

    // Yardımcı fonksiyonlar
    const handleLobbyCreated = (lobbyData) => {
      if (lobbyData.createdBy !== currentUser?.id) {
        setLobbies((prev) => {
          if (prev.some((l) => l.lobbyCode === lobbyData.lobbyCode))
            return prev;
          return [...prev, lobbyData];
        });
      }
      setMembersByLobby((prev) => ({
        ...prev,
        [lobbyData.lobbyCode]: lobbyData.members || [],
      }));
    };

    const handleUserJoined = (data) => {
      const { lobbyCode, data: userData } = data;

      // Global lobi listesini güncelle
      setLobbies((prev) =>
        prev.map((lobby) => {
          if (lobby.lobbyCode === lobbyCode) {
            return {
              ...lobby,
              members: [
                ...lobby.members,
                {
                  id: userData.userId,
                  name: userData.name,
                  avatar: userData.avatar,
                  isHost: userData.isHost,
                },
              ],
            };
          }
          return lobby;
        })
      );

      // İlgili lobinin üye listesini güncelle
      setMembersByLobby((prev) => ({
        ...prev,
        [lobbyCode]: [
          ...(prev[lobbyCode] || []),
          {
            id: userData.userId,
            name: userData.name,
            avatar: userData.avatar,
            isHost: userData.isHost,
          },
        ],
      }));
      console.log("membersByLobby : ", membersByLobby);
    };

    const handleUserLeft = (data) => {
      const {
        lobbyCode,
        data: { userId },
      } = data;

      // Global lobi listesini güncelle
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyCode
            ? {
                ...lobby,
                members: lobby.members.filter((m) => m.id !== userId),
              }
            : lobby
        )
      );

      setMembersByLobby((prev) => ({
        ...prev,
        [lobbyCode]: (prev[lobbyCode] || []).filter((m) => m.id !== userId),
      }));
    };

    const handleLobbyDeleted = (lobbyCode, lobbyData) => {
      setDeletedLobbyInfo({
        lobbyCode,
        reason: lobbyData?.reason || "Lobby has been deleted by the host.",
      });

      setLobbies((prev) => prev.filter((l) => l.lobbyCode !== lobbyCode));
      if (existingLobby?.lobbyCode === lobbyCode) {
        setExistingLobby(null);
        localStorage.removeItem("userLobby");
      }

      // Remove members data for this lobby
      setMembersByLobby((prev) => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });
    };

    const handleHostReturned = (data) => {
      const { lobbyCode, data: hostData } = data;
      console.log("HOST_RETURNED mesajı alındı:", data); // Mesajı logla

      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyCode
            ? {
                ...lobby,
                status: "active",
                members: lobby.members.map((member) => ({
                  ...member,
                  isHost: member.id === hostData.userId,
                })),
              }
            : lobby
        )
      );
      setMembersByLobby((prev) => {
        const currentMembers = prev[lobbyCode] || [];

        // Find if user already exists
        const existingMemberIndex = currentMembers.findIndex(
          (member) => member.id === hostData.userId
        );

        let updatedMembers;
        if (existingMemberIndex !== -1) {
          // Update existing member
          updatedMembers = [...currentMembers];
          updatedMembers[existingMemberIndex] = {
            id: hostData.userId,
            name: hostData.name,
            avatar: hostData.avatar,
            isHost: hostData.isHost,
          };
        } else {
          // Add new member if not exists
          updatedMembers = [
            ...currentMembers,
            {
              id: hostData.userId,
              name: hostData.name,
              avatar: hostData.avatar,
              isHost: hostData.isHost,
            },
          ];
        }

        return {
          ...prev,
          [lobbyCode]: updatedMembers,
        };
      });
    };

    const handleLobbyExpired = (data) => {
      const { lobbyCode } = data;
      setLobbies((prev) => prev.filter((l) => l.lobbyCode !== lobbyCode));

      // İlgili lobinin üye listesini temizle
      setMembersByLobby((prev) => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });

      if (existingLobby?.lobbyCode === lobbyCode) {
        setExistingLobby(null);
        localStorage.removeItem("userLobby");
      }
    };

    const handleEventStatus = (data) => {
      const { lobbyCode, status, message } = data;

      // Eğer event bitmiş ise
      if (status === "ended") {
        // Lobi listesinden kaldır
        setLobbies((prev) =>
          prev.filter((lobby) => lobby.lobbyCode !== lobbyCode)
        );

        // Üye listesini temizle
        setMembersByLobby((prev) => {
          const newState = { ...prev };
          delete newState[lobbyCode];
          return newState;
        });

        // Eğer kullanıcı bu lobideyse
        if (existingLobby?.lobbyCode === lobbyCode) {
          setExistingLobby(null);
          localStorage.removeItem("userLobby");

          // Set deleted lobby info instead of navigating
          setDeletedLobbyInfo({
            lobbyCode,
            reason: message || "Event has ended",
          });
        }
      } else {
        // Diğer durumlar için normal güncelleme
        setLobbies((prev) =>
          prev.map((lobby) =>
            lobby.lobbyCode === lobbyCode ? { ...lobby, status } : lobby
          )
        );
      }
    };

    const handleLobbyRemoved = (lobbyCode) => {
      // Remove the lobby from the global list
      setLobbies((prev) =>
        prev.filter((lobby) => lobby.lobbyCode !== lobbyCode)
      );

      // Clean up the corresponding members list
      setMembersByLobby((prev) => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });

      // If the current user is in this lobby, set deleted info instead of navigating
      if (existingLobby?.lobbyCode === lobbyCode) {
        setExistingLobby(null);
        localStorage.removeItem("userLobby");
        setDeletedLobbyInfo({
          lobbyCode,
          reason: "Event has ended",
        });
      }
    };

    const handleLobbyUpdated = (lobbyData) => {
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyData.lobbyCode ? lobbyData : lobby
        )
      );
    };

    socket.addEventListener("message", handleWebSocketMessage);
    return () => socket.removeEventListener("message", handleWebSocketMessage);
  }, [
    socket,
    currentUser,
    existingLobby,
    setLobbies,
    setMembersByLobby,
    setExistingLobby,
    navigate,
    setDeletedLobbyInfo,
  ]);

  return isWebSocketUpdate;
};

export default useLobbyWebSocket;

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
  setDeletedLobbyInfo,setUserLeftInfo
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
            case "LOBBY_MEMBER_COUNT_UPDATED":
            handleLobbyMemberCountUpdate(data.data);
            break;
          case "USER_LEFT":
            handleUserLeft(data);
            break;
            case "PLAYER_KICKED_BY_HOST": // Sunucudan gelen mesaj bu şekildeyse
            handlePlayerKickedByHost(data.data); // data.data içinde kickedUserId, kickedUserName, lobbyCode olmalı
            break;
          case "USER_KICKED": // Eğer atılan kullanıcıya özel bu mesaj geliyorsa
            handleUserKicked(data); // data içinde lobbyCode ve reason olmalı
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
    };
    const handleLobbyMemberCountUpdate = (updateData) => {
      const { lobbyCode,members } = updateData; 
  
      if (!lobbyCode || !members) {
          console.error("LOBBY_MEMBER_COUNT_UPDATED event missing lobbyCode or members", updateData);
          return;
      }
  
      setLobbies((prevLobbies) =>
          prevLobbies.map((lobby) =>
              lobby.lobbyCode === lobbyCode
                  ? { ...lobby, members: members} 
                  : lobby
          )
      );
  
      setMembersByLobby((prevMembersByLobby) => ({
          ...prevMembersByLobby,
          [lobbyCode]: members || [], 
      }));
  };
    const handleUserLeft = (data) => {
      const {
        lobbyCode,
        data: { userId,name},
      } = data;
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
      setUserLeftInfo({ lobbyCode, name });
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
      setMembersByLobby((prev) => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });
    };

    const handleHostReturned = (data) => {
      const { lobbyCode, data: hostData } = data;   

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
      const isUserInLobby = membersByLobby[lobbyCode]?.some(member => member.id === currentUser?.id);
    
      if (status === "ended") {
        setLobbies((prev) =>
          prev.filter((lobby) => lobby.lobbyCode !== lobbyCode)
        );
    
        setMembersByLobby((prev) => {
          const newState = { ...prev };
          delete newState[lobbyCode];
          return newState;
        });
    
        if (existingLobby?.lobbyCode === lobbyCode || isUserInLobby) {
          setExistingLobby(null);
          localStorage.removeItem("userLobby");
    
          setDeletedLobbyInfo({
            lobbyCode,
            reason: message || "Event has ended",
          });
        }
      } else {
        setLobbies((prev) =>
          prev.map((lobby) =>
            lobby.lobbyCode === lobbyCode ? { ...lobby, status } : lobby
          )
        );
      }
    };

    const handleLobbyRemoved = (lobbyCode) => {
      const isUserInLobby = membersByLobby[lobbyCode]?.some(member => member.id === currentUser?.id);
      
      setLobbies((prev) =>
        prev.filter((lobby) => lobby.lobbyCode !== lobbyCode)
      );
    
      setMembersByLobby((prev) => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });
    
      if (existingLobby?.lobbyCode === lobbyCode || isUserInLobby) {
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

    const handlePlayerKickedByHost = (kickData) => {
      const { lobbyCode, kickedUserId, kickedUserName } = kickData;

      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyCode
            ? {
                ...lobby,
                members: lobby.members.filter((m) => m.id !== kickedUserId),
              }
            : lobby
        )
      );
      setMembersByLobby((prev) => ({
        ...prev,
        [lobbyCode]: (prev[lobbyCode] || []).filter((m) => m.id !== kickedUserId),
      }));

      // Snackbar için bilgi ayarla (kendi atılma durumumuz "USER_KICKED" ile ele alınacak)
      if (currentUser?.id !== kickedUserId) {
        setUserLeftInfo({ lobbyCode, name: kickedUserName, reason: "kicked" });
      }
    };

    const handleUserKicked = (kickData) => {
      const { lobbyCode, reason } = kickData;

      setDeletedLobbyInfo({
        lobbyCode,
        reason: reason || "You have been kicked from the lobby by the host.",
        isKicked: true,
      });

      // Eğer atıldığı lobi, KENDİSİNİN HOST OLDUĞU AKTİF LOBİ ise (existingLobby),
      // o zaman local state'i ve localStorage'ı temizle.
      // Bu durum aslında pek olası değil, çünkü host kendini atamaz, ama güvenlik için kalabilir.
      // Daha önemlisi, eğer host başka birini atıyorsa ve sunucu LOBBY_DELETED gönderiyorsa (host ayrılınca),
      // o zaman burası zaten tetiklenmez, LOBBY_DELETED tetiklenir.
      // Bu case daha çok, kullanıcının ÜYE OLDUĞU bir lobiden atılması için.
      if (existingLobby?.lobbyCode === lobbyCode && existingLobby?.createdBy === currentUser?.id) {
        console.warn("Host kendi host olduğu lobiden atıldı olarak işaretlendi, bu durum incelenmeli.", lobbyCode);
        setExistingLobby(null);
        localStorage.removeItem("userLobby");
      }
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

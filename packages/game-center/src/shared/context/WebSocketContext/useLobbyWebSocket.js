import { useState, useEffect } from "react";

const useLobbyWebSocket = (
  socket,
  currentUser,
  setLobbies,
  existingLobby,
  setMembersByLobby, // Değişen parametre
  setExistingLobby
) => {
  const [isWebSocketUpdate, setIsWebSocketUpdate] = useState(false);

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
            handleLobbyDeleted(data.lobbyCode);
            break;
          case "LOBBY_EXPIRED":
            handleLobbyExpired(data);
            break;
          case "EVENT_STATUS":
            handleEventStatus(data);
            break;
          default:
            console.warn("Bilinmeyen WebSocket mesaj türü:", data.type);
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
          if (prev.some((l) => l.lobbyCode === lobbyData.lobbyCode)) return prev;
          return [...prev, lobbyData];
        });
      }
      // Yeni lobby için boş üye listesi oluştur
      setMembersByLobby(prev => ({
        ...prev,
        [lobbyData.lobbyCode]: []
      }));
    };

    const handleUserJoined = (data) => {
      const { lobbyCode, data: userData } = data;
      
      // Global lobi listesini güncelle
      setLobbies(prev => prev.map(lobby => {
        if (lobby.lobbyCode === lobbyCode) {
          return {
            ...lobby,
            members: [...lobby.members, {
              id: userData.userId,
              name: userData.userName,
              avatar: userData.avatar,
              isHost: false
            }]
          };
        }
        return lobby;
      }));

      // İlgili lobinin üye listesini güncelle
      setMembersByLobby(prev => ({
        ...prev,
        [lobbyCode]: [
          ...(prev[lobbyCode] || []),
          {
            id: userData.userId,
            name: userData.userName,
            avatar: userData.avatar,
            isHost: false
          }
        ]
      }));
    };

    const handleUserLeft = (data) => {
      const { lobbyCode, data: { userId } } = data;

      // Global lobi listesini güncelle
      setLobbies(prev => prev.map(lobby => 
        lobby.lobbyCode === lobbyCode 
          ? { ...lobby, members: lobby.members.filter(m => m.id !== userId) }
          : lobby
      ));

      // İlgili lobinin üye listesini güncelle
      setMembersByLobby(prev => ({
        ...prev,
        [lobbyCode]: (prev[lobbyCode] || []).filter(m => m.id !== userId)
      }));
    };

    const handleLobbyDeleted = (lobbyCode) => {
      setLobbies(prev => prev.filter(l => l.lobbyCode !== lobbyCode));
      // İlgili lobinin üye listesini temizle
      setMembersByLobby(prev => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });
    };

    const handleLobbyExpired = (data) => {
      const { lobbyCode } = data;
      setLobbies(prev => prev.filter(l => l.lobbyCode !== lobbyCode));
      
      // İlgili lobinin üye listesini temizle
      setMembersByLobby(prev => {
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
      setLobbies(prev => prev.map(lobby =>
        lobby.lobbyCode === data.lobbyCode
          ? { ...lobby, status: data.status }
          : lobby
      ));
    };

    socket.addEventListener("message", handleWebSocketMessage);
    return () => socket.removeEventListener("message", handleWebSocketMessage);
  }, [
    socket,
    currentUser,
    existingLobby,
    setLobbies,
    setMembersByLobby,
    setExistingLobby
  ]);

  return isWebSocketUpdate;
};

export default useLobbyWebSocket;
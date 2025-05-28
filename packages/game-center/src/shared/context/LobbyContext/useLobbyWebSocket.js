import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

const useLobbyWebSocket = (
  socket,
  currentUser,
  setLobbies,
  existingLobby,
  setMembersByLobby,
  setExistingLobby,
  membersByLobby,
  setDeletedLobbyInfo,
  setUserLeftInfo,
  showTurnNotification,
  
) => {
  const [isWebSocketUpdate, setIsWebSocketUpdate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const{t}=useTranslation();
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleWebSocketMessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
console.log("WebSocket mesajı:", data);
      if (!data.type) {
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
          case "PLAYER_KICKED_BY_HOST":
            handlePlayerKickedByHost(data.data);
            break;
          case "USER_KICKED":
            handleUserKicked(data);
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
          case "HANGMAN_TURN_CHANGE":
            if (currentUser?.id && data.sharedGameState?.currentPlayerId === currentUser.id) {
              const gameLobbyCode = data.sharedGameState?.lobbyCode;
              const gameLobbyName = data.sharedGameState?.lobbyName || (t ? t('Hangman', 'Adam Asmaca') : 'Adam Asmaca');
            
              if (gameLobbyCode && showTurnNotification) {
                const message = t ? t('notifications.yourTurnInGame', { gameName: gameLobbyName }) : `lobby: ${gameLobbyName}`;
                showTurnNotification(gameLobbyCode, gameLobbyName, message);
              }
            }
            break;
          default:
            break;
        }
      } catch (error) {
        // Optional: Keep error logging for production monitoring if needed, or remove if truly not desired.
        // console.error("[useLobbyWebSocket] Error processing WebSocket message:", error, "Message data:", data);
      } finally {
        setIsWebSocketUpdate(false);
      }
    };

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
            if (lobby.members.some(member => member.id === userData.userId)) {
              return lobby;
            }
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
      setMembersByLobby((prev) => {
        const currentMembers = prev[lobbyCode] || [];
        if (currentMembers.some(member => member.id === userData.userId)) {
          return prev;
        }
        return {
          ...prev,
          [lobbyCode]: [
            ...currentMembers,
            {
              id: userData.userId,
              name: userData.name,
              avatar: userData.avatar,
              isHost: userData.isHost,
            },
          ],
        };
      });
    };

    const handleLobbyMemberCountUpdate = (updateData) => {
      const { lobbyCode, members } = updateData;
      if (!lobbyCode || !members) {
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
      const { lobbyCode, data: { userId, name} } = data;
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyCode
            ? { ...lobby, members: lobby.members.filter((m) => m.id !== userId) }
            : lobby
        )
      );
      setMembersByLobby((prev) => ({
        ...prev,
        [lobbyCode]: (prev[lobbyCode] || []).filter((m) => m.id !== userId),
      }));
      if (currentUser?.id !== userId) {
        setUserLeftInfo({ lobbyCode, name });
      }
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
                createdBy: hostData.userId,
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
        const updatedMembers = currentMembers.map(member => ({
          ...member,
          isHost: member.id === hostData.userId,
        }));
        if (!updatedMembers.some(m => m.id === hostData.userId) && hostData.name && hostData.avatar !== undefined) {
            updatedMembers.push({
                id: hostData.userId,
                name: hostData.name,
                avatar: hostData.avatar,
                isHost: true,
            });
        }
        return { ...prev, [lobbyCode]: updatedMembers };
      });
    };

    const handleLobbyExpired = (data) => {
      const { lobbyCode } = data;
      setLobbies((prev) => prev.filter((l) => l.lobbyCode !== lobbyCode));
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
      const isUserInLobby = (membersByLobby[lobbyCode] || []).some(member => member.id === currentUser?.id);
      if (status === "ended") {
        setLobbies((prev) => prev.filter((lobby) => lobby.lobbyCode !== lobbyCode));
        setMembersByLobby((prev) => {
          const newState = { ...prev };
          delete newState[lobbyCode];
          return newState;
        });
        if (existingLobby?.lobbyCode === lobbyCode || isUserInLobby) {
          setExistingLobby(null);
          localStorage.removeItem("userLobby");
          setDeletedLobbyInfo({ lobbyCode, reason: message || "Event has ended" });
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
      const isUserInLobby = (membersByLobby[lobbyCode] || []).some(member => member.id === currentUser?.id);
      setLobbies((prev) => prev.filter((lobby) => lobby.lobbyCode !== lobbyCode));
      setMembersByLobby((prev) => {
        const newState = { ...prev };
        delete newState[lobbyCode];
        return newState;
      });
      if (existingLobby?.lobbyCode === lobbyCode || isUserInLobby) {
        setExistingLobby(null);
        localStorage.removeItem("userLobby");
        setDeletedLobbyInfo({ lobbyCode, reason: "The event or lobby has been removed." });
      }
    };

    const handleLobbyUpdated = (lobbyData) => {
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyData.lobbyCode ? { ...lobby, ...lobbyData } : lobby
        )
      );
       if (existingLobby && existingLobby.lobbyCode === lobbyData.lobbyCode) {
        setExistingLobby(prev => ({ ...prev, ...lobbyData }));
      }
    };

    const handlePlayerKickedByHost = (kickData) => {
      const { lobbyCode, kickedUserId, kickedUserName } = kickData;
      setLobbies((prev) =>
        prev.map((lobby) =>
          lobby.lobbyCode === lobbyCode
            ? { ...lobby, members: lobby.members.filter((m) => m.id !== kickedUserId) }
            : lobby
        )
      );
      setMembersByLobby((prev) => ({
        ...prev,
        [lobbyCode]: (prev[lobbyCode] || []).filter((m) => m.id !== kickedUserId),
      }));
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
      if (existingLobby?.lobbyCode === lobbyCode && existingLobby.createdBy === currentUser?.id) {
        setExistingLobby(null);
        localStorage.removeItem("userLobby");
      } else if (existingLobby?.lobbyCode === lobbyCode && existingLobby.createdBy !== currentUser?.id){
         setExistingLobby(null);
         localStorage.removeItem("userLobby");
      }
    };

    socket.addEventListener("message", handleWebSocketMessage);
    return () => {
      socket.removeEventListener("message", handleWebSocketMessage);
    };
  }, [
    socket,
    currentUser,
    existingLobby,
    setLobbies,
    setMembersByLobby,
    setExistingLobby,
    navigate,
    setDeletedLobbyInfo,
    setUserLeftInfo,
    showTurnNotification,
    t,
    location,
    membersByLobby 
  ]);

  return isWebSocketUpdate;
};

export default useLobbyWebSocket;
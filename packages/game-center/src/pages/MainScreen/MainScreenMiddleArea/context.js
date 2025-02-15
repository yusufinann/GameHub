import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { lobbyApi } from "../api";
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
import { useAuthContext } from "../../../shared/context/AuthContext";
import useLobbyWebSocket from "../../../shared/context/WebSocketContext/useLobbyWebSocket";

const LobbyContext = createContext();

export const LobbyProvider = ({ children }) => {
  const [existingLobby, setExistingLobby] = useState(null);
  const [lobbies, setLobbies] = useState([]);
  const [lobbyCode, setLobbyCode] = useState("");
  const [lobbyLink, setLobbyLink] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [membersByLobby, setMembersByLobby] = useState({}); // Lobby bazlı üye listesi

  const { socket } = useWebSocket();
  const { currentUser } = useAuthContext();

  const isWebSocketUpdate = useLobbyWebSocket(
    socket,
    currentUser,
    setLobbies,
    existingLobby,
    setMembersByLobby, // Güncellendi
    setExistingLobby
  );

  const hostLeaveLobbyTimer = useCallback(
    async (lobbyCode) => {
      // 1 dakika sonra lobi silme zamanlayıcısı
      const timer = setTimeout(async () => {
        try {
          // Lobi bilgilerini tekrar çek
          const lobbies = await lobbyApi.fetchLobbies();
          const lobby = lobbies.find(l => l.lobbyCode === lobbyCode);
  
          if (lobby && lobby.lobbyType === 'normal') {
            // Lobi üyelerini anlık olarak çıkar
            const deletionData = {
              lobbyCode,
              reason: 'Host did not return within 1 minute'
            };
  
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: 'HOST_LEAVE_TIMEOUT',
                  data: deletionData
                })
              );
  
              await lobbyApi.deleteLobbyApi(lobbyCode);
            }
          }
        } catch (error) {
          console.error('Error in host leave timeout:', error);
        }
      }, 1 * 60 * 1000); // 1 dakika
  
      return timer;
    },
    [socket]
  );
  const hostReturnLobby = useCallback(
    async (lobbyCode) => {
      try {
        // Clear any existing host leave timer
        const hostLeaveTimer = localStorage.getItem(`hostLeaveTimer_${lobbyCode}`);
        if (hostLeaveTimer) {
          clearTimeout(hostLeaveTimer);
          localStorage.removeItem(`hostLeaveTimer_${lobbyCode}`);
        }
  
        // Broadcast host return via WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: 'HOST_RETURNED',
              lobbyCode,
              userId: currentUser?.id,
              userName: currentUser?.name,
              avatar: currentUser?.avatar,
            })
          );
        }
      } catch (error) {
        console.error('Error in host return:', error);
      }
    },
    [socket, currentUser]
  );
  
  const fetchAndSetLobbies = useCallback(async () => {
    try {
      const lobbies = await lobbyApi.fetchLobbies();
      const sortedLobbies = lobbies.sort((a, b) => {
        if (a.lobbyType === "event" && b.lobbyType !== "event") return -1;
        if (a.lobbyType !== "event" && b.lobbyType === "event") return 1;
        return 0;
      });
      setLobbies(sortedLobbies);

      // Lobi üyelerini lobbyCode bazlı olarak kaydet
      const membersMap = {};
      sortedLobbies.forEach(lobby => {
        membersMap[lobby.lobbyCode] = lobby.members;
      });
      setMembersByLobby(membersMap);

      // Kullanıcının lobisi var mı kontrol et
      const userLobby = sortedLobbies.find(
        (lobby) => lobby.createdBy === currentUser?.id
      );

      if (userLobby) {
        const generatedLobbyLink = `${window.location.origin}/lobby/${userLobby.lobbyCode}`;
        setExistingLobby(userLobby);
        setLobbyCode(userLobby.lobbyCode);
        setLobbyLink(generatedLobbyLink);
        setIsJoined(true);
        localStorage.setItem(
          "userLobby",
          JSON.stringify({
            ...userLobby,
            lobbyLink: generatedLobbyLink,
          })
        );
      } else {
        localStorage.removeItem("userLobby");
        setExistingLobby(null);
        setLobbyCode("");
        setLobbyLink("");
        setIsJoined(false);
      }
    } catch (error) {
      console.error("Error fetching lobbies:", error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    fetchAndSetLobbies();
  }, [fetchAndSetLobbies]);

  const createLobby = useCallback(
    async (lobbyData) => {
      try {
        const savedLobby = localStorage.getItem("userLobby");
        if (existingLobby || savedLobby) {
          throw new Error(
            "You already have one lobby. You cannot create more than one lobby."
          );
        }

        if (lobbyData.lobbyType !== "event") {
          lobbyData.expiryTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
        }

        const response = await lobbyApi.createLobbyApi(lobbyData);
        const { lobby, lobbyLink, members: lobbyMembers } = response;

        if (!isWebSocketUpdate) {
          setExistingLobby(lobby);
          setLobbies((prev) => [...prev, lobby]);
          setLobbyCode(lobby.lobbyCode);
          setLobbyLink(lobbyLink);
          setMembersByLobby(prev => ({
            ...prev,
            [lobby.lobbyCode]: lobbyMembers
          }));
          setIsJoined(true);
          localStorage.setItem(
            "userLobby",
            JSON.stringify({
              ...lobby,
              lobbyLink: `${window.location.origin}/lobby/${lobby.lobbyCode}`,
              members: lobbyMembers,
            })
          );
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "LOBBY_CREATED",
              data: {
                ...lobby,
                createdBy: currentUser?.id,
              },
            })
          );
        }

        return response;
      } catch (error) {
        throw error;
      }
    },
    [socket, isWebSocketUpdate, currentUser, existingLobby]
  );

  const deleteLobby = useCallback(
    async (lobbyCode) => {
      try {
        await lobbyApi.deleteLobbyApi(lobbyCode);

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "LOBBY_DELETED",
              lobbyCode,
            })
          );
        }

        setLobbies((prev) => prev.filter((lobby) => lobby.lobbyCode !== lobbyCode));
        setMembersByLobby(prev => {
          const newState = { ...prev };
          delete newState[lobbyCode];
          return newState;
        });

        if (existingLobby?.lobbyCode === lobbyCode) {
          setExistingLobby(null);
          setLobbyCode("");
          setLobbyLink("");
          localStorage.removeItem("userLobby");
        }
      } catch (error) {
        throw error;
      }
    },
    [socket, existingLobby]
  );

  const leaveLobby = useCallback(
    async (lobbyCode, userId) => {
      try {
        const lobby = lobbies.find(l => l.lobbyCode === lobbyCode);
        // Eğer çıkan kullanıcı host ise ve normal lobi ise
      if (lobby && lobby.createdBy === userId && lobby.lobbyType === 'normal') {
        const leaveTimer = await hostLeaveLobbyTimer(lobbyCode);
        // Timer bilgisini bir yerde saklamak isterseniz (opsiyonel)
        localStorage.setItem(`hostLeaveTimer_${lobbyCode}`, leaveTimer);
      }
      
        await lobbyApi.leaveLobbyApi(lobbyCode, userId);

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "USER_LEFT",
              lobbyCode,
              data: { userId },
            })
          );
        }

        setLobbies((prev) =>
          prev.map((lobby) =>
            lobby.lobbyCode === lobbyCode
              ? {
                  ...lobby,
                  members: lobby.members.filter((member) => member.id !== userId),
                }
              : lobby
          )
        );

        setMembersByLobby(prev => ({
          ...prev,
          [lobbyCode]: (prev[lobbyCode] || []).filter(member => member.id !== userId)
        }));

        if (existingLobby?.lobbyCode === lobbyCode) {
          setExistingLobby(null);
          setLobbyCode("");
          setLobbyLink("");
          localStorage.removeItem("userLobby");
          setIsJoined(false);
        }
      } catch (error) {
        throw error;
      }
    },
    [socket, existingLobby,lobbies,hostLeaveLobbyTimer]
  );

  return (
    <LobbyContext.Provider
      value={{
        existingLobby,
        setExistingLobby,
        lobbies,
        setLobbies,
        lobbyCode,
        lobbyLink,
        membersByLobby, // Yeni state
        setMembersByLobby, // Yeni state
        isJoined,
        setIsJoined,
        createLobby,
        deleteLobby,
        leaveLobby,hostReturnLobby
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error("useLobbyContext must be used within a LobbyProvider");
  }
  return context; 
};
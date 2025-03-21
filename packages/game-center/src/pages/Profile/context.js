// FriendsContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useWebSocket } from "../../shared/context/WebSocketContext/context";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useParams } from "react-router-dom";

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const { socket } = useWebSocket();
  const { currentUser } = useAuthContext();
  const { userId } = useParams(); // Profil veya görüntülenen kullanıcı ID'si

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  // WebSocket üzerinden mesaj göndermek için yardımcı fonksiyon
  const sendMessage = useCallback(
    (message) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      } else {
        console.error("WebSocket bağlantısı kapalı veya hazır değil.");
      }
    },
    [socket]
  );

  // HTTP üzerinden arkadaş listesini çekme fonksiyonu
  const fetchFriendListHTTP = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/friendlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFriends(data.friends || []);
    } catch (error) {
      console.error("Arkadaş listesi alınırken hata oluştu (HTTP):", error);
    }
  }, []);


  // Arkadaşlık isteği gönderme
  const sendFriendRequest = (targetUserId) => {
    setOutgoingRequests((prev) => {
      const newRequest = {
        id: targetUserId.toString(),
      };
      if (!prev.some((req) => req.id?.toString() === targetUserId.toString())) {
        return [...prev, newRequest];
      }
      return prev;
    });
    sendMessage({
      type: "FRIEND_REQUEST",
      targetUserId: targetUserId.toString(),
    });
  };

  // Arkadaşlık isteğini kabul etme
  const acceptFriendRequest = (requesterId) => {
    setIncomingRequests((prev) =>
      prev.filter((req) => req.id.toString() !== requesterId.toString())
    );
    sendMessage({
      type: "FRIEND_REQUEST_ACCEPT",
      requesterId: requesterId.toString(),
    });
  };

  // Arkadaşlık isteğini reddetme
  const rejectFriendRequest = (requesterId) => {
    setIncomingRequests((prev) =>
      prev.filter((req) => req.id.toString() !== requesterId.toString())
    );

    sendMessage({
      type: "FRIEND_REQUEST_REJECT",
      requesterId: requesterId.toString(),
    });
  };

  // Arkadaşı listeden çıkarma
  const removeFriend = (friendId) => {
    setFriends((prev) =>
      prev.filter((friend) => friend.id.toString() !== friendId.toString())
    );
    setOutgoingRequests((prev) =>
      prev.filter((request) => {
        if (typeof request === "object") {
          return request.id.toString() !== friendId.toString();
        }
        return request.toString() !== friendId.toString();
      })
    );
    sendMessage({ type: "FRIEND_REMOVE", friendId: friendId.toString() });
  };


  const requestFriendRequests = useCallback(() => {
    sendMessage({ type: "GET_FRIEND_REQUESTS" });
  }, [sendMessage]);

  // WebSocket mesajlarını dinleyerek state güncellemesi yapıyoruz
  const handleSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!currentUser) return;

        switch (data.type) {
          case "FRIEND_REQUEST":
            if (data.status === "success") {
              setOutgoingRequests((prev) => {
                const newRequest = {
                  id: data.targetUserId.toString(),
                };
                if (
                  !prev.some(
                    (req) => req.id?.toString() === data.targetUserId.toString()
                  )
                ) {
                  return [...prev, newRequest];
                }
                return prev;
              });
            }
            break;
          case "FRIEND_REQUEST_RECEIVED":
            if (
              data.receiverId &&
              currentUser.id.toString() === data.receiverId.toString()
            ) {
              setIncomingRequests((prev) => {
                if (
                  !prev.some(
                    (req) => req.id.toString() === data.sender.id.toString()
                  )
                ) {
                  return [...prev, data.sender];
                }
                return prev;
              });
            }
            break;
          case "FRIEND_REQUEST_ACCEPTED":
            if (
              data.receiverId &&
              currentUser.id.toString() === data.receiverId.toString()
            ) {
              setFriends((prev) => {
                if (
                  !prev.some(
                    (f) => f.id.toString() === data.acceptedBy.id.toString()
                  )
                ) {
                  return [...prev, data.acceptedBy];
                }
                return prev;
              });
              setOutgoingRequests((prev) =>
                prev.filter(
                  (id) => id.toString() !== data.acceptedBy.id.toString()
                )
              );
            }
            break;
          case "FRIEND_REQUEST_REJECTED":
            if (
              data.requesterId &&
              currentUser.id.toString() === data.requesterId.toString()
            ) {
              setOutgoingRequests((prev) =>
                prev.filter(
                  (id) => id.toString() !== data.rejectedBy.toString()
                )
              );
            }
            break;
          case "FRIEND_REQUESTS_LIST":
            setIncomingRequests(data.incoming || []);
            setOutgoingRequests(data.outgoing || []);
            break;
          case "FRIEND_REMOVED":
            if (
              data.receiverId &&
              currentUser.id.toString() === data.receiverId.toString()
            ) {
              setFriends((prev) =>
                prev.filter(
                  (friend) => friend.id.toString() !== data.removedBy.toString()
                )
              );
              setOutgoingRequests((prev) =>
                prev.filter((request) => {
                  if (typeof request === "object") {
                    return request.id.toString() !== data.removedBy.toString();
                  }
                  return request.toString() !== data.removedBy.toString();
                })
              );
            }
            break;
            case "FRIEND_STATUS_UPDATE":
              if (data.userId) {
                setFriends((prevFriends) => {
                  return prevFriends.map((friend) => {
                    if (friend.id.toString() === data.userId.toString()) {
                      return { ...friend, isOnline: data.isOnline };
                    }
                    return friend;
                  });
                });
              }
              break;
            default:
            break;
        }
      } catch (error) {
        console.error("FriendsContext: Mesaj ayrıştırma hatası", error);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!socket) return;

    socket.addEventListener("message", handleSocketMessage);
    const handleOpen = () => {
      fetchFriendListHTTP(); 
      requestFriendRequests(); 
    };

    socket.addEventListener("open", handleOpen);

    if (socket.readyState === WebSocket.OPEN) {
      handleOpen(); 
    }

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
      socket.removeEventListener("open", handleOpen);
    };
  }, [socket, handleSocketMessage, requestFriendRequests, fetchFriendListHTTP]);

  const isFriend = friends.some((friend) => friend.id.toString() === userId);
  const isRequestSent = outgoingRequests
    .map((request) => request.id?.toString())
    .includes(userId?.toString());
  return (
    <FriendsContext.Provider
      value={{
        incomingRequests,
        outgoingRequests,
        friends,
        setFriends, 
        fetchFriendListHTTP, 
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        isFriend,
        isRequestSent,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriendsContext = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriendsContext must be used within a FriendsProvider");
  }
  return context;
};

export default FriendsContext;
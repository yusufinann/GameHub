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

  // Arkadaşlık isteği gönderme
  const sendFriendRequest = (targetUserId) => {
    setOutgoingRequests((prev) => {
      // Eğer outgoingRequests obje array'i ise:
      const newRequest = {
        id: targetUserId.toString(),
        // Diğer bilgiler mevcut değilse boş bırakılabilir
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
    // Also clear this user ID from outgoing requests to ensure clean state
    setOutgoingRequests((prev) =>
      prev.filter((request) => {
        // Eğer request bir obje ise
        if (typeof request === "object") {
          return request.id.toString() !== friendId.toString();
        }
        // Eğer request direkt ID ise
        return request.toString() !== friendId.toString();
      })
    );
    sendMessage({ type: "FRIEND_REMOVE", friendId: friendId.toString() });
  };

  // Sunucudan arkadaş listesini ve gelen istekleri talep etme
  const requestFriendList = useCallback(() => {
    sendMessage({ type: "GET_FRIEND_LIST" });
  }, [sendMessage]);

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
              // İstek başarılı olduğunda state'i güncelle
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
            // Yalnızca currentUser için gönderildiyse (receiverId eşleşiyorsa) ekle
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
            // İstek gönderenin (currentUser) alacağı mesaj; receiverId currentUser.id olmalı
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
            // İstek gönderenin (currentUser) alacağı mesaj; userId karşı tarafın ID'si olmalı
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
          case "GET_FRIEND_LIST":
            setFriends(data.friends || []);
            break;
          case "FRIEND_REQUESTS_LIST":
            setIncomingRequests(data.incoming || []);
            setOutgoingRequests(data.outgoing || []); // Giden istekleri kaydet
            break;
          case "FRIEND_REMOVED":
            // Alıcıya gönderilen mesaj; currentUser arkadaşlıktan çıkarılan tarafsa
            if (
              data.receiverId &&
              currentUser.id.toString() === data.receiverId.toString()
            ) {
              setFriends((prev) =>
                prev.filter(
                  (friend) => friend.id.toString() !== data.removedBy.toString()
                )
              );
              // Arkadaşlıktan çıkarıldığında outgoingRequests'ten de temizle
              setOutgoingRequests((prev) =>
                prev.filter((request) => {
                  // Eğer request bir obje ise
                  if (typeof request === "object") {
                    return request.id.toString() !== data.removedBy.toString();
                  }
                  // Eğer request direkt ID ise
                  return request.toString() !== data.removedBy.toString();
                })
              );
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
      requestFriendList();
      requestFriendRequests();
    };

     socket.addEventListener("open", handleOpen);
    // Sayfa yüklendiğinde (veya socket değiştiğinde) istekleri gönder
    if (socket.readyState === WebSocket.OPEN) {
        requestFriendList(); // <--- This is also called immediately if socket is already open!
        requestFriendRequests(); // <--- And this too!
    }

    return () => {
      socket.removeEventListener("message", handleSocketMessage);
      socket.removeEventListener("open", handleOpen);
    };
  }, [socket, handleSocketMessage, requestFriendList, requestFriendRequests]);

  const isFriend = friends.some((friend) => friend.id.toString() === userId);
  const isRequestSent = outgoingRequests
    .map((request) => request.id?.toString()) // Obje ise ID'yi al
    .includes(userId?.toString()); // Mevcut profil ID'si gönderilenlerde var mı?
  return (
    <FriendsContext.Provider
      value={{
        incomingRequests,
        outgoingRequests,
        friends,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        requestFriendList,
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

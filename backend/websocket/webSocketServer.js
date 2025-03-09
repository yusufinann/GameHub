// websocket.js
import { WebSocketServer } from "ws";
import {
  handleFriendRemove,
  handleFriendRequest,
  handleFriendRequestAccept,
  handleFriendRequestReject,
  handleGetFriendList,
  handleGetFriendRequests,
} from "../controllers/friend.controller.js";
import * as bingoGameController from "../controllers/bingo.game.controller.js";
import * as lobbyController from "../controllers/lobby.controller.js";
import * as authController from "../controllers/auth.controller.js";
import * as lobbyChatController from "../controllers/lobbyChat.controller.js";
// Aktif bağlantıları kullanıcı ID'siyle saklamak için Map kullanıyoruz
const connectedClients = new Map();
const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  const pingInterval = setInterval(() => {
    connectedClients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log("Bağlantı aktif değil, sonlandırılıyor:", ws.userId);
        return ws.terminate();
      }
      ws.isAlive = false;
      if (ws.readyState === ws.OPEN) {
        ws.ping((err) => {
          if (err) console.error("Ping gönderim hatası:", err);
        });
      }
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(pingInterval);
  });

  wss.on("connection", (ws, request) => {
    console.log("Yeni bir istemci bağlandı.");
    ws.isAlive = true;

    try {
      // URL query parametresinden userId alınır
      const userId = new URL(request.url, "http://localhost").searchParams.get(
        "userId"
      );
      if (userId) {
        ws.userId = userId;
        connectedClients.set(userId, ws);
        console.log(`Client connected with userId: ${userId}`);

        ws.on("close", () => {
          for (const [id, client] of connectedClients.entries()) {
            if (client === ws) {
              connectedClients.delete(id);
              console.log(`Client disconnected: ${id}`);
              break;
            }
          }
          console.log("İstemci bağlantısı kesildi.");
        });
      } else {
        console.log("No userId provided in connection");
        ws.close(); 
      }
    } catch (error) {
      console.error("Error parsing userId from connection URL:", error);
      ws.close();
    }

    ws.on("pong", () => {
      ws.isAlive = true;
      console.log("Pong alındı: Bağlantı aktif.", ws.userId);
    });

    ws.on("message", (message) => handleMessage(ws, message));

    ws.on("error", (error) => {
      console.error("WebSocket hatası:", error);

      if (ws.userId) {
        broadcastUserStatusEvent(ws.userId, false);
      }
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          connectedClients.delete(userId);
          console.log(`Client removed due to error: ${userId}`);
          break;
        }
      }
    });
  });

  const handleMessage = (ws, message) => {
    try {
      const data = JSON.parse(message);
      console.log("İstemciden gelen mesaj:", data);

      switch (data.type) {
        case "FRIEND_REQUEST":
          handleFriendRequest(ws, data);
          break;
        case "FRIEND_REQUEST_ACCEPT":
          handleFriendRequestAccept(ws, data);
          break;
        case "FRIEND_REQUEST_REJECT":
          handleFriendRequestReject(ws, data);
          break;
        case "FRIEND_REMOVE":
          handleFriendRemove(ws, data);
          break;
        case "GET_FRIEND_LIST":
          handleGetFriendList(ws);
          break;
        case "GET_FRIEND_REQUESTS":
          handleGetFriendRequests(ws);
          break;

        case "LOBBY_CREATED":
          broadcastToOthers(ws, { type: "LOBBY_CREATED", data: data.data });
          break;
        case "USER_JOINED":
          broadcastToOthers(ws, {
            type: "USER_JOINED",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "USER_LEFT":
          broadcastToOthers(ws, {
            type: "USER_LEFT",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "LOBBY_DELETED":
          if(data.lobbyCode){
            lobbyChatController.clearChatHistory(data.lobbyCode);
            broadcastToAll({
              type: "LOBBY_DELETED",
              lobbyCode: data.lobbyCode,
            });
          }
        
          break;
        case "LOBBY_REMOVED":
          broadcastToAll({
            type: "LOBBY_REMOVED",
            lobbyCode: data.lobbyCode,
            reason: data.reason,
          });
          break;
        case "LOBBY_UPDATED":
          broadcastToOthers(ws, {
            type: "LOBBY_UPDATED",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "HOST_RETURNED":
          broadcastToOthers(ws, {
            type: "HOST_RETURNED",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "NEW_HOST":
          broadcastToOthers(ws, {
            type: "NEW_HOST",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "USER_KICKED":
          broadcastToOthers(ws, {
            type: "USER_KICKED",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "EVENT_START_NOTIFICATION":
          broadcastToSpecificUsers(data.data, {
            type: "EVENT_START_NOTIFICATION",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "LOBBY_EXPIRED":
          broadcastToOthers(ws, {
            type: "LOBBY_EXPIRED",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;
        case "GAME_TERMINATED":
          broadcastToSpecificUsers(data.data, {
            type: "GAME_TERMINATED",
            lobbyCode: data.lobbyCode,
            data: data.data,
          });
          break;

        // Tombala (Bingo) ile ilgili mesajlar:
        case "BINGO_JOIN":
          // Kullanıcı oyuna katılmak istiyor
          bingoGameController.joinGame(ws, data);
          break;
        case "BINGO_START":
          // Oyunu başlatmak istiyor (host tarafından)
          bingoGameController.startGame(ws, data);
          break;
        case "BINGO_DRAW":
          // Yeni numara çekme isteği
          bingoGameController.drawNumber(ws, data);
          break;
        case "BINGO_CALL":
          // Kullanıcı bingo dediğinde kontrol et
          bingoGameController.checkBingo(ws, data);
          break;
        case "BINGO_MARK_NUMBER":
          // Kullanıcının işaretlediği numarayı kaydet
          bingoGameController.markNumber(ws, data);
          break;

          case "LOBBY_INVITATION":
            const { recipientId, lobby, sender } = data;
            if (recipientId) {
              broadcastFriendEvent(recipientId, {
                type: "LOBBY_INVITATION_RECEIVED",
                lobby: lobby,
                sender: sender,
              });
            } else {
              console.error("Recipient ID is missing for lobby invitation.");
            }
            break;

            case "SEND_EXPRESSION":
              // İfade mesajını al ve tüm lobidekilere yayınla (gönderen dahil)
              const { lobbyCode, expression,senderName, senderUsername, senderId } = data;
               // Lobby Chat Controller kullanarak mesajı sakla
          lobbyChatController.storeMessage(lobbyCode, { senderName, senderUsername, senderId, expression });

              broadcastToAll({ // broadcastToAll kullanılıyor
                type: "RECEIVE_EXPRESSION",
                data: {
                  lobbyCode: lobbyCode,
                  expression: expression,
                  senderName: senderName,
                  senderUsername: senderUsername,
                  senderId: senderId,
                },
              });
              break;
              case "GET_CHAT_HISTORY": // Yeni mesaj tipi: Chat geçmişini isteme
              const requestedLobbyCode = data.lobbyCode;
              // Lobby Chat Controller kullanarak chat geçmişini al
              const historyToSend = lobbyChatController.getChatHistory(requestedLobbyCode);
              ws.send(JSON.stringify({
                type: "CHAT_HISTORY", // Yeni mesaj tipi: Chat geçmişini gönderme
                lobbyCode: requestedLobbyCode,
                history: historyToSend,
              }));
              break;

        default:
          console.log("Bilinmeyen mesaj tipi:", data.type);
      }
      sendAcknowledgement(ws, data);
    } catch (error) {
      console.error("Mesaj işleme hatası:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Mesaj işlenirken bir hata oluştu.",
        })
      );
    }
  };

  const broadcastToOthers = (sender, data) => {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client !== sender && client.readyState === client.OPEN) {
        client.send(message, (err) => {
          if (err) console.error("Mesaj gönderimi hatası:", err);
        });
      }
    });
  };

  const sendAcknowledgement = (ws, originalMessage) => {
    const ack = {
      type: "ACKNOWLEDGEMENT",
      messageType: originalMessage.type,
      timestamp: new Date().toISOString(),
    };
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(ack), (err) => {
        if (err) console.error("ACK gönderimi hatası:", err);
      });
    }
  };

  const broadcastToAll = (data) => {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message, (err) => {
          if (err) console.error("Mesaj gönderimi hatası:", err);
        });
      }
    });
  };

  const broadcastToSpecificUsers = (userIds, data) => {
    const message = JSON.stringify(data);
    userIds.forEach((userId) => {
      const clientWs = connectedClients.get(userId.toString());
      if (clientWs && clientWs.readyState === clientWs.OPEN) {
        clientWs.send(message, (err) => {
          if (err) console.error("Message sending error:", err);
        });
      }
    });
  };

  // Lobby bildirimleri için broadcast fonksiyonu
  const broadcastLobbyEvent = (
    lobbyCode,
    eventType,
    data,
    specificUserIds = null
  ) => {
    const message = { type: eventType, lobbyCode, data };
    if (!specificUserIds) {
      broadcastToAll(message);
      return;
    }
    if (Array.isArray(specificUserIds)) {
      broadcastToSpecificUsers(specificUserIds, message);
    } else {
      broadcastToAll(message);
    }
  };

  // Arkadaşlık (friend) bildirimleri için ayrı broadcast fonksiyonu: payload'u direkt gönderiyoruz.
  const broadcastFriendEvent = (targetUserId, payload) => {
    const clientWs = connectedClients.get(targetUserId.toString());
    if (clientWs && clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(payload));
    }
  };

  // User  online/offline status
  const broadcastUserStatusEvent = (userId, isOnline) => {
    const message = {
      type: "USER_STATUS",
      userId: userId,
      isOnline: isOnline,
    };
    console.log("User status broadcast:", message);
    broadcastToAll(message);
  };

  console.log("WebSocket sunucusu başlatıldı.");

  // Initialize controllers with broadcast functions
  lobbyController.initializeWebSocket({
    broadcastLobbyEvent,
    broadcastToAll,
    broadcastToSpecificUsers,
  });
  authController.initializeAuthWebSocket({ broadcastUserStatusEvent });

  return {
    broadcastLobbyEvent,
    broadcastFriendEvent,
    broadcastToAll,
    broadcastUserStatusEvent,
    getConnectedClientsCount: () => connectedClients.size,
  };
};

export default setupWebSocket;

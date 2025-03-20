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
import User from "../models/user.model.js";
import GroupChat from "../models/groupChat.model.js";
import FriendGroupChat from "../models/friendGroupChat.model.js"; // Import FriendGroupChat model
import * as bingoGameController from "../controllers/bingo.game.controller.js";
import * as lobbyController from "../controllers/lobby.controller.js";
import * as authController from "../controllers/auth.controller.js";
import * as lobbyChatController from "../controllers/lobbyChat.controller.js";
import * as communityChatController from "../controllers/communityChat.controller.js";
import * as privateChatController from "../controllers/privateChat.controller.js";
import * as groupChatController from "../controllers/groupChat.controller.js";
import * as friendGroupChatController from "../controllers/friendGroupChat.controller.js";
import { formatFriendGroupResponse } from "../controllers/friendGroupChat.controller.js";
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
              broadcastUserStatusEvent(id, false); // Offline status when disconnected
              break;
            }
          }
          console.log("İstemci bağlantısı kesildi.");
        });
        broadcastUserStatusEvent(userId, true); // Online status when connected
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

  const handleMessage = async (ws, message) => {
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
          if (data.lobbyCode) {
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
          bingoGameController.joinGame(ws, data);
          break;
        case "BINGO_START":
          bingoGameController.startGame(ws, data);
          break;
        case "BINGO_DRAW":
          bingoGameController.drawNumber(ws, data);
          break;
        case "BINGO_CALL":
          bingoGameController.checkBingo(ws, data);
          break;
        case "BINGO_MARK_NUMBER":
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
          const {
            lobbyCode,
            expression,
            senderName,
            senderUsername,
            senderId,
          } = data;
          lobbyChatController.storeMessage(lobbyCode, {
            senderName,
            senderUsername,
            senderId,
            expression,
          });

          broadcastToAll({
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
        case "GET_CHAT_HISTORY":
          const requestedLobbyCode = data.lobbyCode;
          const historyToSend =
            lobbyChatController.getChatHistory(requestedLobbyCode);
          ws.send(
            JSON.stringify({
              type: "CHAT_HISTORY",
              lobbyCode: requestedLobbyCode,
              history: historyToSend,
            })
          );
          break;

        // Topluluk Sohbeti Mesajları
        case "COMMUNITY_MESSAGE":
          if (!ws.userId) {
            console.error(
              "Kullanıcı ID'si bulunamadı, topluluk mesajı gönderilemez."
            );
            return;
          }
          const { message: communityMessageText } = data;
          if (!communityMessageText) {
            console.error("Mesaj içeriği boş olamaz.");
            return;
          }

          try {
            console.log(
              `Topluluk mesajı alındı from userId: ${ws.userId}: ${communityMessageText}`
            );
            const savedMessage =
              await communityChatController.storeCommunityMessage(
                ws.userId,
                communityMessageText
              );
            console.log("Topluluk mesajı kaydedildi:", savedMessage);

            const messageToBroadcast = {
              type: "RECEIVE_COMMUNITY_MESSAGE",
              message: savedMessage,
            };
            broadcastToAll(messageToBroadcast);
            console.log("Topluluk mesajı yayınlandı:", messageToBroadcast);
          } catch (error) {
            console.error("Topluluk mesajı yayınlama hatası:", error);
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Topluluk mesajı gönderilirken bir hata oluştu.",
              })
            );
          }
          break;

        case "GET_COMMUNITY_CHAT_HISTORY":
          try {
            const history =
              await communityChatController.getRecentCommunityChatHistory();
            ws.send(
              JSON.stringify({
                type: "COMMUNITY_CHAT_HISTORY",
                history: history,
              })
            );
          } catch (error) {
            console.error("Topluluk sohbet geçmişi alınırken hata:", error);
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Sohbet geçmişi alınırken bir hata oluştu.",
              })
            );
          }
          break;

        // Özel Sohbet Mesajları
        case "PRIVATE_MESSAGE":
          if (!ws.userId) {
            console.error(
              "Kullanıcı ID'si bulunamadı, özel mesaj gönderilemez."
            );
            return;
          }
          const { receiverId, message: privateMessageText } = data;
          if (!receiverId || !privateMessageText) {
            console.error("Alıcı ID'si veya mesaj içeriği eksik.");
            return;
          }

          try {
            const savedMessage =
              await privateChatController.storePrivateMessage(
                ws.userId,
                receiverId,
                privateMessageText
              );

            const messageToSender = {
              type: "RECEIVE_PRIVATE_MESSAGE",
              message: savedMessage,
              isSelf: true,
            };
            sendToSpecificUser(ws.userId, messageToSender);

            const messageToReceiver = {
              type: "RECEIVE_PRIVATE_MESSAGE",
              message: savedMessage,
              isSelf: false,
            };
            sendToSpecificUser(receiverId, messageToReceiver);
          } catch (error) {
            console.error("Özel mesaj yayınlama hatası:", error);
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Özel mesaj gönderilirken bir hata oluştu.",
              })
            );
          }
          break;

        case "GET_PRIVATE_CHAT_HISTORY":
          if (!ws.userId) {
            console.error(
              "Kullanıcı ID'si bulunamadı, özel sohbet geçmişi alınamaz."
            );
            return;
          }
          const { targetUserId } = data;
          if (!targetUserId) {
            console.error("Hedef kullanıcı ID'si eksik.");
            return;
          }
          try {
            const history = await privateChatController.getPrivateChatHistory(
              ws.userId,
              targetUserId
            );
            ws.send(
              JSON.stringify({
                type: "PRIVATE_CHAT_HISTORY",
                history: history,
                targetUserId: targetUserId,
              })
            );
          } catch (error) {
            console.error("Özel sohbet geçmişi alınırken hata:", error);
            ws.send(
              JSON.stringify({
                type: "ERROR",
                message: "Özel sohbet geçmişi alınırken bir hata oluştu.",
              })
            );
          }
          break;
          
        // Grup Sohbeti Mesajları
        case "CREATE_GROUP":
          groupChatController.createGroup(ws, data, broadcastToAll);
          break;
        case "JOIN_GROUP":
          groupChatController.joinGroup(
            ws,
            data,
            (messageToSend) => sendToSpecificUser(ws.userId, messageToSend),
            broadcastGroupEvent,
            broadcastToAll
          );
          break;
        case "LEAVE_GROUP":
          groupChatController.leaveGroup(
            ws,
            data,
            (messageToSend) => sendToSpecificUser(ws.userId, messageToSend),
            broadcastGroupEvent,
            broadcastToAll
          );
          break;
        case "GET_ALL_GROUPS":
          groupChatController.getAllGroups(ws, (messageToSend) =>
            sendToSpecificUser(ws.userId, messageToSend)
          );
          break;
        case "GET_USER_GROUPS":
          groupChatController.getUserGroups(ws, (messageToSend) =>
            sendToSpecificUser(ws.userId, messageToSend)
          );
          break;
        case "UPDATE_GROUP":
          groupChatController.updateGroup(
            ws,
            data,
            (messageToSend) => sendToSpecificUser(ws.userId, messageToSend),
            broadcastGroupEvent
          );
          break;
        case "DELETE_GROUP":
          groupChatController.deleteGroup(
            ws,
            data,
            (messageToSend) => sendToSpecificUser(ws.userId, messageToSend),
            broadcastGroupEvent,
            broadcastToAll
          );
          break;
        case "GROUP_MESSAGE":
          groupChatController.sendGroupMessage(ws, data, broadcastGroupMessage);
          break;
        case "GET_GROUP_CHAT_HISTORY":
          groupChatController.getGroupChatHistory(ws, data, (messageToSend) =>
            sendToSpecificUser(ws.userId, messageToSend)
          );
          break;

        // Friend Group Sohbeti Mesajları
        case "JOIN_FRIEND_GROUP_WS":
          friendGroupChatController.joinFriendGroupWebSocket(
            ws,
            data,
            broadcastFriendGroupEvent,
            broadcastToAll,
            sendToSpecificUser
          );
          break;
        case "LEAVE_FRIEND_GROUP_WS":
          friendGroupChatController.leaveFriendGroupWebSocket(
            ws,
            data,
            broadcastFriendGroupEvent,
            broadcastToAll
          );
          break;
        case "UPDATE_FRIEND_GROUP_WS":
          break;
        case "DELETE_FRIEND_GROUP_WS":
          friendGroupChatController.deleteFriendGroup(
            ws,
            data,
            broadcastFriendGroupEvent,
            broadcastToAll
          );
          break;
        case "FRIEND_GROUP_MESSAGE_WS":
          friendGroupChatController.sendFriendGroupMessage(
            ws,
            data,
            broadcastFriendGroupMessage
          );
          break;
        case "INVITE_FRIEND_TO_FRIEND_GROUP_WS":
          const { groupId, friendId } = data;
          broadcastFriendEvent(friendId, {
            type: "FRIEND_GROUP_INVITATION_RECEIVED",
            groupId: groupId,
            inviterId: ws.userId,
          });
          break;
        case "ACCEPT_FRIEND_GROUP_INVITATION_WS":
          const { acceptedGroupId } = data;

          friendGroupChatController.joinFriendGroupWebSocket(
            ws,
            { groupId: acceptedGroupId, password: null },
            broadcastFriendGroupEvent,
            broadcastToAll,
            sendToSpecificUser
          );
          break;
        case "REJECT_FRIEND_GROUP_INVITATION_WS":
          const { rejectedGroupId } = data;
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
  const sendToSpecificUser = (userId, data) => {
    const clientWs = connectedClients.get(userId.toString());
    if (clientWs && clientWs.readyState === clientWs.OPEN) {
      const message = JSON.stringify(data);
      clientWs.send(message, (err) => {
        if (err)
          console.error(`Kullanıcıya mesaj gönderim hatası ${userId}:`, err);
      });
    } else {
      console.log(`Kullanıcı çevrimdışı veya bağlantı kapalı: ${userId}`);
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
  const broadcastGroupEvent = (groupId, eventType, data) => {
    GroupChat.findById(groupId)
      .populate("members")
      .then((group) => {
        if (!group) {
          console.log(`Grup bulunamadı: ${groupId}`);
          return;
        }
        const message = { type: eventType, groupId: groupId, data: data };
        group.members.forEach((member) => {
          sendToSpecificUser(member._id.toString(), message);
        });
      })
      .catch((err) => {
        console.error("Grup üyelerini alırken hata:", err);
      });
  };

  const broadcastGroupMessage = (groupId, eventType, data, senderId) => {
    GroupChat.findById(groupId)
      .populate("members")
      .then((group) => {
        if (!group) {
          console.log(`Grup bulunamadı: ${groupId}`);
          return;
        }
        const message = { type: eventType, groupId: groupId, data: data };
        group.members.forEach((member) => {
          if (member._id.toString() !== senderId) {
            sendToSpecificUser(member._id.toString(), message);
          }
        });
        sendToSpecificUser(senderId, message);
      })
      .catch((err) => {
        console.error("Grup üyelerini alırken hata:", err);
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
  const broadcastFriendGroupEvent = (groupId, eventType, data) => {
    FriendGroupChat.findById(groupId)
      .populate("members")
      .then(async (group) => {
        if (!group) {
          console.log(`Friend Grup bulunamadı: ${groupId}`);
          return;
        }
        const populatedGroup = await FriendGroupChat.findById(groupId).populate(
          { path: "members", select: "_id username name avatar" }
        );
        const message = {
          type: eventType,
          groupId: groupId,
          data: { ...data, group: formatFriendGroupResponse(populatedGroup) },
        };
        group.members.forEach((member) => {
          sendToSpecificUser(member._id.toString(), message);
        });
      })
      .catch((err) => {
        console.error("Friend Grup üyelerini alırken hata:", err);
      });
  };

  const broadcastFriendGroupMessage = (groupId, eventType, data, senderId) => {
    FriendGroupChat.findById(groupId)
      .populate("members")
      .then((group) => {
        if (!group) {
          console.log(`Friend Grup bulunamadı: ${groupId}`);
          return;
        }
        const message = { type: eventType, groupId: groupId, data: data };
        group.members.forEach((member) => {
          if (member._id.toString() !== senderId) {
            sendToSpecificUser(member._id.toString(), message);
          }
        });
        sendToSpecificUser(senderId, message);
      })
      .catch((err) => {
        console.error("Friend Grup üyelerini alırken hata:", err);
      });
  };
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

  const broadcastFriendEvent = (targetUserId, payload) => {
    console.log("broadcastFriendEvent çağrıldı:", { targetUserId, payload });
    const clientWs = connectedClients.get(targetUserId.toString());
    if (clientWs && clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(payload));
    } else {
      console.log("Kullanıcı çevrimdışı veya bağlantı kapalı:", targetUserId);
    }
  };
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

  lobbyController.initializeWebSocket({
    broadcastLobbyEvent,
    broadcastToAll,
    broadcastToSpecificUsers,
  });
  authController.initializeAuthWebSocket({ broadcastUserStatusEvent });
  friendGroupChatController.initializeFriendGroupChatWebSocket({
    broadcastFriendGroupEvent,
    broadcastToAll,
    sendToSpecificUser,
    broadcastFriendGroupMessage,
    broadcastFriendEvent,
  });
  groupChatController.initializeGroupChatWebSocket({
    broadcastGroupEvent,
    broadcastToAll,
    sendToSpecificUser,
    broadcastGroupMessage,
  });
  return {
    broadcastLobbyEvent,
    broadcastFriendEvent,
    broadcastToAll,
    broadcastUserStatusEvent,
    getConnectedClientsCount: () => connectedClients.size,
    sendToSpecificUser,
  };
};

export default setupWebSocket;

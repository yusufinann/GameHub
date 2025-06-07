// messageRouter.js
import {
  handleFriendRemove,
  handleFriendRequest,
  handleFriendRequestAccept,
  handleFriendRequestReject,
  handleGetFriendRequests,
} from "../controllers/friend.controller.js";
import * as bingoGameController from "../controllers/bingo.game.controller.js";
import * as lobbyController from "../controllers/lobby.controller.js";
import * as lobbyChatController from "../controllers/lobbyChat.controller.js";
import * as communityChatController from "../controllers/communityChat.controller.js";
import * as privateChatController from "../controllers/privateChat.controller.js";
import * as groupChatController from "../controllers/groupChat.controller.js";
import * as friendGroupChatController from "../controllers/friendGroupChat.controller.js";
import * as hangmanGameController from "../controllers/hangman.controller.js";

export const routeMessage = async (ws, message, broadcasters) => {
  try {
    const data = JSON.parse(message);
    console.log("İstemciden gelen mesaj:", data); // For debugging

    const {
      sendToSpecificUser,
      broadcastToOthers,
      broadcastToAll,
      broadcastToSpecificUsers,
      broadcastGroupEvent,
      broadcastGroupMessage,
      broadcastFriendGroupEvent,
      broadcastFriendGroupMessage,
      broadcastFriendEvent,
      broadcastToLobbyMembers,
      sendAcknowledgement,
    } = broadcasters;

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
      case "GET_FRIEND_REQUESTS":
        handleGetFriendRequests(ws);
        break;

      case "LOBBY_CREATED":
        broadcastToOthers(ws, { type: "LOBBY_CREATED", data: data.data });
        break;
      case "LOBBY_DELETED":
        if (data.lobbyCode) {
          lobbyChatController.clearChatHistory(data.lobbyCode);
          broadcastToAll({
            type: "LOBBY_DELETED",
            data: {
              lobbyCode: data.lobbyCode,
              reason: data.reason || "Lobi silindi",
            }
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
        broadcastToAll({
          type: "LOBBY_UPDATED",
          data: data.data,
        });
        break;
      case "HOST_RETURNED":
        if (typeof lobbyController.broadcastLobbyEvent === 'function') {
            lobbyController.broadcastLobbyEvent(data.lobbyCode, "HOST_RETURNED", data.data, data.data?.membersToNotify || null);
        } else {
            console.warn("HOST_RETURNED: lobbyController.broadcastLobbyEvent not available. Using passed broadcasters.");
            const payload = { type: "HOST_RETURNED", data: data.data, lobbyCode: data.lobbyCode };
            if (data.data && data.data.membersToNotify) {
                 broadcastToSpecificUsers(data.data.membersToNotify, payload);
            } else {
                 broadcastToLobbyMembers(data.lobbyCode, "HOST_RETURNED", data.data);
            }
        }
        break;
      case "KICK_PLAYER":
        if (ws.userId) {
          await lobbyController.kickPlayerFromLobby(ws, data, sendToSpecificUser);
        } else {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Oyuncu atmak için giriş yapmış olmalısınız.",
            })
          );
        }
        break;
      case "EVENT_START_NOTIFICATION":
        broadcastToSpecificUsers(data.data.userIds, {
          type: "EVENT_START_NOTIFICATION",
          lobbyCode: data.lobbyCode,
          data: data.data.notificationData,
        });
        break;
      case "LOBBY_EXPIRED":
        broadcastToAll({
          type: "LOBBY_EXPIRED",
          lobbyCode: data.lobbyCode,
        });
        break;
      case "GAME_TERMINATED":
        broadcastToSpecificUsers(data.data.userIds, {
          type: "GAME_TERMINATED",
          lobbyCode: data.lobbyCode,
          data: data.data.terminationData,
        });
        break;

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
          lobbyCode: expressionLobbyCode,
          expression,
          senderName,
          senderUsername,
          senderId,
          senderAvatar,
        } = data;

        lobbyChatController.storeMessage(expressionLobbyCode, {
          senderName,
          senderUsername,
          senderId,
          expression,
          senderAvatar,
        });

        await broadcastToLobbyMembers(expressionLobbyCode, "RECEIVE_EXPRESSION", {
          expression,
          senderName,
          senderUsername,
          senderId,
          senderAvatar,
          lobbyCode: expressionLobbyCode,
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
          const savedMessage =
            await communityChatController.storeCommunityMessage(
              ws.userId,
              communityMessageText
            );
          broadcastToAll({
            type: "RECEIVE_COMMUNITY_MESSAGE",
            message: savedMessage,
          });
        } catch (error) {
          console.error("Topluluk mesajı yayınlama hatası:", error);
          sendToSpecificUser(ws.userId, {
            type: "ERROR",
            message: "Topluluk mesajı gönderilirken bir hata oluştu.",
          });
        }
        break;

      case "PRIVATE_MESSAGE":
        if (!ws.userId) {
          console.error("Kullanıcı ID'si bulunamadı, özel mesaj gönderilemez.");
          return;
        }
        const { receiverId: privateReceiverId, message: privateMessageText } = data;
        if (!privateReceiverId || !privateMessageText) {
          console.error("Alıcı ID'si veya mesaj içeriği eksik.");
          return;
        }
        try {
          const savedPrivateMessage = await privateChatController.storePrivateMessage(
            ws.userId,
            privateReceiverId,
            privateMessageText
          );
          sendToSpecificUser(ws.userId, {
            type: "RECEIVE_PRIVATE_MESSAGE",
            message: savedPrivateMessage,
            isSelf: true,
          });
          sendToSpecificUser(privateReceiverId, {
            type: "RECEIVE_PRIVATE_MESSAGE",
            message: savedPrivateMessage,
            isSelf: false,
          });
        } catch (error) {
          console.error("Özel mesaj yayınlama hatası:", error);
          sendToSpecificUser(ws.userId, {
            type: "ERROR",
            message: "Özel mesaj gönderilirken bir hata oluştu.",
          });
        }
        break;

      case "CREATE_GROUP":
        groupChatController.createGroup(ws, data, broadcastToAll);
        break;
      case "JOIN_GROUP":
        groupChatController.joinGroup(
          ws,
          data,
          sendToSpecificUser,
          broadcastGroupEvent,
          broadcastToAll
        );
        break;
      case "LEAVE_GROUP":
        groupChatController.leaveGroup(
          ws,
          data,
          sendToSpecificUser,
          broadcastGroupEvent,
          broadcastToAll
        );
        break;
      case "UPDATE_GROUP":
        groupChatController.updateGroup(
          ws,
          data,
          sendToSpecificUser,
          broadcastGroupEvent
        );
        break;
      case "DELETE_GROUP":
        groupChatController.deleteGroup(
          ws,
          data,
          sendToSpecificUser,
          broadcastGroupEvent,
          broadcastToAll
        );
        break;
      case "GROUP_MESSAGE":
        groupChatController.sendGroupMessage(ws, data, broadcastGroupMessage);
        break;

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
        friendGroupChatController.updateFriendGroup(
          ws,
          data,
          broadcastFriendGroupEvent,
          broadcastToAll
        );
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
        const { groupId: inviteGroupId, friendId } = data;
        broadcastFriendEvent(friendId, {
          type: "FRIEND_GROUP_INVITATION_RECEIVED",
          groupId: inviteGroupId,
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
        console.log(
          `User ${ws.userId} rejected invitation to group ${data.rejectedGroupId}`
        );
        break;

      case "HANGMAN_JOIN":
        hangmanGameController.joinGame(ws, data);
        break;
      case "HANGMAN_START":
        hangmanGameController.startGame(ws, data);
        break;
      case "HANGMAN_GUESS_LETTER":
        hangmanGameController.guessLetter(ws, data);
        break;
      case "HANGMAN_GUESS_WORD":
        hangmanGameController.guessWord(ws, data);
        break;
      case "HANGMAN_END_GAME":
        hangmanGameController.endGame(ws, data);
        break;
      case "HANGMAN_ADD_CATEGORY":
        hangmanGameController.addCustomCategory(ws, data);
        break;
      case "HANGMAN_GET_GAME_STATE":
        hangmanGameController.getGameState(ws, data);
        break;
      case "HANGMAN_GET_CATEGORIES":
        if (typeof hangmanGameController.getCategories === 'function') {
          hangmanGameController.getCategories(ws);
        } else {
          console.error("Error: hangmanGameController.getCategories is not a function in router.");
          ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Server error processing category request." }));
        }
        break;
      case "HANGMAN_GET_LANGUAGE_CATEGORIES":
        if (typeof hangmanGameController.getLanguageCategories === 'function') {
          hangmanGameController.getLanguageCategories(ws, data);
        } else {
          console.error("Error: hangmanGameController.getLanguageCategories is not a function in router.");
          ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Server error processing language category request." }));
        }
        break;
      default:
        console.log("Bilinmeyen mesaj tipi:", data.type);
    }

    sendAcknowledgement(ws, data);
  } catch (error) {
    console.error("Mesaj işleme hatası:", error);
    if (ws.readyState === ws.OPEN) {
      let originalType = 'unknown';
      try {
        if (message && typeof message === 'string') {
          const parsedMessage = JSON.parse(message);
          originalType = parsedMessage.type || 'unknown';
        }
      } catch (parseError) {
        // message might not be valid JSON, or not have a type
      }
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Mesaj işlenirken bir sunucu hatası oluştu.",
          originalMessageType: originalType,
        })
      );
    }
  }
};
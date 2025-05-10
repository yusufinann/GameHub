// messageRouter.js
import {
    handleFriendRemove,
    handleFriendRequest,
    handleFriendRequestAccept,
    handleFriendRequestReject,
    handleGetFriendRequests,
} from "../controllers/friend.controller.js";
import * as bingoGameController from "../controllers/bingo.game.controller.js";
// Keep lobby controller import separate if initialized elsewhere
// import * as lobbyController from "../controllers/lobby.controller.js";
import * as lobbyChatController from "../controllers/lobbyChat.controller.js";
import * as communityChatController from "../controllers/communityChat.controller.js";
import * as privateChatController from "../controllers/privateChat.controller.js";
import * as groupChatController from "../controllers/groupChat.controller.js";
import * as friendGroupChatController from "../controllers/friendGroupChat.controller.js";
import * as hangmanGameController from "../controllers/hangman.controller.js"
// Note: Auth controller is likely only needed for initialization, not routing here

// This function handles the core message routing logic
export const routeMessage = async (ws, message, broadcasters) => {
    try {
        const data = JSON.parse(message);
        console.log("İstemciden gelen mesaj:", data);

        // Destructure broadcasters for easier use
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
            sendAcknowledgement,
        } = broadcasters;

        switch (data.type) {
            // Friend Cases
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

            // Lobby Lifecycle & Event Cases
            case "LOBBY_CREATED":
                broadcastToOthers(ws, { type: "LOBBY_CREATED", data: data.data });
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
                broadcastToAll(ws, {
                    type: "LOBBY_UPDATED",
                    lobbyCode: data.lobbyCode,
                    data: data.data,
                });
                break;
            case "HOST_RETURNED":
                // Assumes data.data contains userIds if specific broadcast is needed
                broadcastLobbyEvent(data.lobbyCode, "HOST_RETURNED", data.data);
                break;
            case "USER_KICKED":
                broadcastToOthers(ws, {
                    type: "USER_KICKED",
                    lobbyCode: data.lobbyCode,
                    data: data.data,
                });
                break;
            case "EVENT_START_NOTIFICATION":
                 broadcastToSpecificUsers(data.data.userIds, { // Assuming data.data contains userIds array
                    type: "EVENT_START_NOTIFICATION",
                    lobbyCode: data.lobbyCode,
                    data: data.data.notificationData 
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
                broadcastToSpecificUsers(data.data.userIds, { // Assuming data.data contains userIds array
                    type: "GAME_TERMINATED",
                    lobbyCode: data.lobbyCode,
                    data: data.data.terminationData 
                });
                break;

            // Bingo Game Cases
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

            // Lobby Invitation Case
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

            // Lobby Chat Cases
            case "SEND_EXPRESSION":
                const { lobbyCode, expression, senderName, senderUsername, senderId, senderAvatar } = data;
                lobbyChatController.storeMessage(lobbyCode, { senderName, senderUsername, senderId, expression, senderAvatar });
                broadcastToAll({
                    type: "RECEIVE_EXPRESSION",
                    data: { lobbyCode, expression, senderName, senderUsername, senderId, senderAvatar },
                });
                break;
            case "GET_CHAT_HISTORY":
                const requestedLobbyCode = data.lobbyCode;
                const historyToSend = lobbyChatController.getChatHistory(requestedLobbyCode);
                ws.send(JSON.stringify({ type: "CHAT_HISTORY", lobbyCode: requestedLobbyCode, history: historyToSend }));
                break;

            // Community Chat Case
            case "COMMUNITY_MESSAGE":
                if (!ws.userId) {
                    console.error("Kullanıcı ID'si bulunamadı, topluluk mesajı gönderilemez.");
                    return; // Exit early
                }
                const { message: communityMessageText } = data;
                if (!communityMessageText) {
                    console.error("Mesaj içeriği boş olamaz.");
                    return; // Exit early
                }
                try {
                    console.log(`Topluluk mesajı alındı from userId: ${ws.userId}: ${communityMessageText}`);
                    const savedMessage = await communityChatController.storeCommunityMessage(ws.userId, communityMessageText);
                    console.log("Topluluk mesajı kaydedildi:", savedMessage);
                    broadcastToAll({ type: "RECEIVE_COMMUNITY_MESSAGE", message: savedMessage });
                    console.log("Topluluk mesajı yayınlandı.");
                } catch (error) {
                    console.error("Topluluk mesajı yayınlama hatası:", error);
                    sendToSpecificUser(ws.userId, { type: "ERROR", message: "Topluluk mesajı gönderilirken bir hata oluştu." });
                }
                break;

            // Private Chat Case
            case "PRIVATE_MESSAGE":
                 if (!ws.userId) {
                    console.error("Kullanıcı ID'si bulunamadı, özel mesaj gönderilemez.");
                    return; // Exit early
                }
                const { receiverId, message: privateMessageText } = data;
                if (!receiverId || !privateMessageText) {
                    console.error("Alıcı ID'si veya mesaj içeriği eksik.");
                    return; // Exit early
                }
                try {
                    const savedMessage = await privateChatController.storePrivateMessage(ws.userId, receiverId, privateMessageText);
                    // Send to self
                    sendToSpecificUser(ws.userId, { type: "RECEIVE_PRIVATE_MESSAGE", message: savedMessage, isSelf: true });
                    // Send to receiver
                    sendToSpecificUser(receiverId, { type: "RECEIVE_PRIVATE_MESSAGE", message: savedMessage, isSelf: false });
                } catch (error) {
                    console.error("Özel mesaj yayınlama hatası:", error);
                     sendToSpecificUser(ws.userId, { type: "ERROR", message: "Özel mesaj gönderilirken bir hata oluştu." });
                }
                break;

            // Group Chat Cases
            case "CREATE_GROUP":
                groupChatController.createGroup(ws, data, broadcastToAll); // Needs ws for response/initial state
                break;
            case "JOIN_GROUP":
                groupChatController.joinGroup(ws, data, sendToSpecificUser, broadcastGroupEvent, broadcastToAll); // Needs ws
                break;
            case "LEAVE_GROUP":
                groupChatController.leaveGroup(ws, data, sendToSpecificUser, broadcastGroupEvent, broadcastToAll); // Needs ws
                break;
            case "UPDATE_GROUP":
                groupChatController.updateGroup(ws, data, sendToSpecificUser, broadcastGroupEvent); // Needs ws
                break;
            case "DELETE_GROUP":
                groupChatController.deleteGroup(ws, data, sendToSpecificUser, broadcastGroupEvent, broadcastToAll); // Needs ws
                break;
            case "GROUP_MESSAGE":
                groupChatController.sendGroupMessage(ws, data, broadcastGroupMessage); // Needs ws for senderId
                break;

            // Friend Group Chat Cases
            case "JOIN_FRIEND_GROUP_WS":
                 friendGroupChatController.joinFriendGroupWebSocket(ws, data, broadcastFriendGroupEvent, broadcastToAll, sendToSpecificUser); // Needs ws
                break;
            case "LEAVE_FRIEND_GROUP_WS":
                friendGroupChatController.leaveFriendGroupWebSocket(ws, data, broadcastFriendGroupEvent, broadcastToAll); // Needs ws
                break;
                case 'UPDATE_FRIEND_GROUP_WS':
                    friendGroupChatController.updateFriendGroup(
                      ws,
                      data,
                      broadcastFriendGroupEvent,
                      broadcastToAll
                    );
                    break;
                    case "DELETE_FRIEND_GROUP_WS":
                        friendGroupChatController.deleteFriendGroup(ws, data, broadcastFriendGroupEvent, broadcastToAll); // Needs ws
                        break;
            case "FRIEND_GROUP_MESSAGE_WS":
                friendGroupChatController.sendFriendGroupMessage(ws, data, broadcastFriendGroupMessage); // Needs ws for senderId
                break;
            case "INVITE_FRIEND_TO_FRIEND_GROUP_WS":
                const { groupId: inviteGroupId, friendId } = data;
                broadcastFriendEvent(friendId, { type: "FRIEND_GROUP_INVITATION_RECEIVED", groupId: inviteGroupId, inviterId: ws.userId });
                break;
            case "ACCEPT_FRIEND_GROUP_INVITATION_WS":
                const { acceptedGroupId } = data;
                friendGroupChatController.joinFriendGroupWebSocket(ws, { groupId: acceptedGroupId, password: null }, broadcastFriendGroupEvent, broadcastToAll, sendToSpecificUser); // Needs ws
                break;
            case "REJECT_FRIEND_GROUP_INVITATION_WS":
                // const { rejectedGroupId } = data; // No specific action needed on server? Maybe notify inviter?
                console.log(`User ${ws.userId} rejected invitation to group ${data.rejectedGroupId}`);
                // Optional: Notify inviter
                // const group = await FriendGroupChat.findById(rejectedGroupId);
                // if (group && group.admin) {
                //     sendToSpecificUser(group.admin.toString(), { type: "FRIEND_GROUP_INVITATION_REJECTED", groupId: rejectedGroupId, userId: ws.userId });
                // }
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
          hangmanGameController.getCategories(ws);
          break;
        case "HANGMAN_GET_WORDS_FOR_CATEGORY":
          hangmanGameController.getWordsForCategory(ws, data);
          break;
            
                // Default case for unknown types
            default:
                console.log("Bilinmeyen mesaj tipi:", data.type);
        }

        // Send acknowledgement for the processed message
        sendAcknowledgement(ws, data);

    } catch (error) {
        console.error("Mesaj işleme hatası:", error);
        // Attempt to send error back to the client who sent the faulty message
        if (ws.readyState === ws.OPEN) {
             ws.send(
                JSON.stringify({
                    type: "ERROR",
                    message: "Mesaj işlenirken bir sunucu hatası oluştu.",
                    originalMessageType: message?.type // Include original type if possible
                })
            );
        }
    }
};
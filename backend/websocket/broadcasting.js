import GroupChat from "../models/groupChat.model.js";
import Lobby from "../models/lobby.model.js";
import FriendGroupChat from "../models/friendGroupChat.model.js";
import { formatFriendGroupResponse } from "../controllers/friendGroupChat.controller.js";

export const createBroadcasters = (connectedClients) => {
    const sendToSpecificUser = (userId, data) => {
        const clientWs = connectedClients.get(userId?.toString()); 
        if (clientWs && clientWs.readyState === clientWs.OPEN) {
            const message = JSON.stringify(data);
            clientWs.send(message, (err) => {
                if (err)
                    console.error(`Kullanıcıya mesaj gönderim hatası ${userId}:`, err);
            });
        } else {
            // Optional: Log less verbosely or remove if too noisy
            // console.log(`Kullanıcı çevrimdışı veya bağlantı kapalı: ${userId}`);
        }
    };

    const broadcastToOthers = (sender, data) => {
        const message = JSON.stringify(data);
        connectedClients.forEach((client, id) => {
            if (client !== sender && client.readyState === client.OPEN) {
                 client.send(message, (err) => {
                    if (err) console.error(`Broadcast (others) error to ${id}:`, err);
                });
            }
        });
    };

    const broadcastToAll = (data) => {
        const message = JSON.stringify(data);
        connectedClients.forEach((client, id) => {
            if (client.readyState === client.OPEN) {
                client.send(message, (err) => {
                    if (err) console.error(`Broadcast (all) error to ${id}:`, err);
                });
            }
        });
    };

    const broadcastToSpecificUsers = (userIds, data) => {
        userIds.forEach((userId) => {
            sendToSpecificUser(userId.toString(), data);
        });
    };

    const broadcastGroupEvent = (groupId, eventType, data) => {
        GroupChat.findById(groupId)
            .populate("members", "_id") 
            .then((group) => {
                if (!group) {
                    console.log(`broadcastGroupEvent: Grup bulunamadı: ${groupId}`);
                    return;
                }
                const message = { type: eventType, groupId: groupId, data: data };
                group.members.forEach((member) => {
                    sendToSpecificUser(member._id.toString(), message);
                });
            })
            .catch((err) => {
                console.error(`broadcastGroupEvent: Grup üyelerini alırken hata (${groupId}):`, err);
            });
    };

    const broadcastGroupMessage = (groupId, eventType, data, senderId) => {
        GroupChat.findById(groupId)
            .populate("members", "_id")
            .then((group) => {
                if (!group) {
                    console.log(`broadcastGroupMessage: Grup bulunamadı: ${groupId}`);
                    return;
                }
                const message = { type: eventType, groupId: groupId, data: data };
                group.members.forEach((member) => {
                    sendToSpecificUser(member._id.toString(), message);
                });
            })
            .catch((err) => {
                console.error(`broadcastGroupMessage: Grup üyelerini alırken hata (${groupId}):`, err);
            });
    };

    const broadcastFriendGroupEvent = (groupId, eventType, data) => {
        FriendGroupChat.findById(groupId)
            .populate("members", "_id")
            .then(async (group) => {
                if (!group) {
                    console.log(`broadcastFriendGroupEvent: Friend Grup bulunamadı: ${groupId}`);
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
                console.error(`broadcastFriendGroupEvent: Friend Grup üyelerini alırken hata (${groupId}):`, err);
            });
    };

    const broadcastFriendGroupMessage = (groupId, eventType, data, senderId) => {
        FriendGroupChat.findById(groupId)
            .populate("members", "_id") 
            .then((group) => {
                if (!group) {
                    console.log(`broadcastFriendGroupMessage: Friend Grup bulunamadı: ${groupId}`);
                    return;
                }
                const message = { type: eventType, groupId: groupId, data: data };
                 group.members.forEach((member) => {
                    sendToSpecificUser(member._id.toString(), message);
                });
            })
            .catch((err) => {
                console.error(`broadcastFriendGroupMessage: Friend Grup üyelerini alırken hata (${groupId}):`, err);
            });
    };

    const broadcastLobbyEvent = (lobbyCode, eventType, data, specificUserIds = null) => {
        const message = { type: eventType, lobbyCode, data };
        if (specificUserIds && Array.isArray(specificUserIds)) {
             broadcastToSpecificUsers(specificUserIds, message);
        } else {
            broadcastToAll(message);
        }
    };

  
    const broadcastToLobbyMembers = async (lobbyCode, eventType, payload) => {
        try {
            const lobby = await Lobby.findOne({ lobbyCode: lobbyCode }).select("members.id").lean();
            if (lobby && lobby.members && lobby.members.length > 0) {
                const memberIds = lobby.members.map(member => member.id.toString());
                const message = {
                    type: eventType,
                    data: { ...payload, lobbyCode: lobbyCode }
                };
                broadcastToSpecificUsers(memberIds, message);
            } else {
                console.warn(`broadcastToLobbyMembers: Lobby '${lobbyCode}' not found or has no members.`);
            }
        } catch (error) {
            console.error(`Error in broadcastToLobbyMembers for lobbyCode ${lobbyCode}, event ${eventType}:`, error);
        }
    };

    const broadcastFriendEvent = (targetUserId, payload) => {
        console.log("Broadcasting Friend Event:", { targetUserId, payload });
        sendToSpecificUser(targetUserId, payload);
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

    return {
        sendToSpecificUser,
        broadcastToOthers,
        broadcastToAll,
        broadcastToSpecificUsers,
        broadcastGroupEvent,
        broadcastGroupMessage,
        broadcastFriendGroupEvent,
        broadcastFriendGroupMessage,
        broadcastLobbyEvent,
        broadcastToLobbyMembers,
        broadcastFriendEvent,
        sendAcknowledgement,
    };
};
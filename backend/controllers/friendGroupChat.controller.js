import FriendGroupChat from "../models/friendGroupChat.model.js";
import User from "../models/user.model.js";
import FriendGroupChatMessage from "../models/friendGroupChatMessage.model.js";


export const formatFriendGroupResponse = (group) => {
    return {
        _id: group._id,
        groupName: group.groupName,
        description: group.description,
        host: {
            _id: group.hostId._id,
            username: group.hostId.username,
            name: group.hostId.name,
            avatar: group.hostId.avatar,
        },
        members: group.members.map(member => ({
            _id: member._id,
            username: member.username,
            name: member.name,
            avatar: member.avatar,
        })),
        maxMembers: group.maxMembers,
        invitationLink: group.invitationLink,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
    };
};


export const createFriendGroup = async (req, res, broadcastFriendEvent) => { 
    try {
        const { groupName, description, password, maxMembers, invitedFriends } = req.body;
        const hostId = req.user._id;
      
        const newGroup = new FriendGroupChat({
            groupName,
            description,
            hostId,
            members: [hostId], 
            password,
            maxMembers,
        });

        await newGroup.save();

    
        const invitationLink = `/conversation/all/friend-group/${newGroup._id}`;
        newGroup.invitationLink = invitationLink;
        await newGroup.save();

        const populatedGroup = await FriendGroupChat.findById(newGroup._id)
            .populate({ path: 'hostId', select: 'username name avatar' })
            .populate({ path: 'members', select: 'username name avatar' });

     
        if (invitedFriends && Array.isArray(invitedFriends) && invitedFriends.length > 0 && broadcastFriendEvent) { // Check if broadcastFriendEvent is available
                invitedFriends.forEach(friendId => {
                    broadcastFriendEvent(friendId, {
                        type: "FRIEND_GROUP_INVITATION_RECEIVED",
                        groupId: populatedGroup._id.toString(),
                        groupName: populatedGroup.groupName,
                        inviterId: hostId.toString(),
                        inviterName: req.user.name,
                        inviterUsername: req.user.username,
                        invitationLink: newGroup.invitationLink
                    });
                    console.log(`Friend group invitation sent to: ${friendId}`);
                });
            } else {
                console.log("WebSocket service not available for friend invitations");
            }


        res.status(201).json({
            message: "Friend Group created successfully",
            group: formatFriendGroupResponse(populatedGroup),
            invitationLink: newGroup.invitationLink 
        });
    } catch (error) {
        console.error("Friend Grup oluşturma hatası:", error);
        res.status(500).json({ message: "Friend Grup oluşturulurken bir hata oluştu." });
    }
};


export const joinFriendGroupWebSocket = async (ws, data, broadcastFriendGroupEvent, broadcastToAll, sendToSpecificUser) => {
    try {
        const { groupId, password } = data; 
        const userId = ws.userId;
        const user = await User.findById(userId).select('username name avatar'); 

        if (!groupId) {
            throw new Error("Grup ID'si gerekli.");
        }

        const group = await FriendGroupChat.findById(groupId).populate('members');
        if (!group) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Friend Grup bulunamadı." }));
        }

        if (group.members.length >= group.maxMembers) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Friend Grup maksimum üye sayısına ulaştı." }));
        }

        if (group.password && group.password !== password && password !== null) { 
            return ws.send(JSON.stringify({ type: "ERROR", message: "Yanlış şifre." }));
        }

        if (group.hostId.toString() !== userId) {
            const hostUser = await User.findById(group.hostId).select('friends');
            const hostFriends = hostUser.friends.map(friendId => friendId.toString());
            if (!hostFriends.includes(userId)) {
                return ws.send(JSON.stringify({ 
                    type: "ERROR", 
                    message: "you must be friends with the founder of the group to join the group" 
                }));
            }
        }

        if (group.members.some(member => member._id.toString() === userId)) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Zaten bu Friend grubun üyesisiniz." }));
        }

        group.members.push(userId);
        await group.save();

        const populatedGroup = await FriendGroupChat.findById(group._id)
            .populate({ path: 'hostId', select: 'username name avatar' })
            .populate({ path: 'members', select: 'username name avatar' });

        if (broadcastFriendGroupEvent) {
           
            broadcastFriendGroupEvent(groupId, "USER_JOINED_FRIEND_GROUP", {
                groupId: groupId,
                userId: userId,
                userInfo: { 
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        }
        if (broadcastToAll) { 
            broadcastToAll({
                type: "FRIEND_GROUP_UPDATED",
                group: formatFriendGroupResponse(populatedGroup),
                groupId: groupId,
            });
        }

        ws.send(JSON.stringify({
            type: "JOIN_FRIEND_GROUP_SUCCESS",
            message: "Friend Gruba başarıyla katıldınız.",
            group: formatFriendGroupResponse(populatedGroup)
        }));

    } catch (error) {
        console.error("Friend Gruba katılma hatası (WebSocket):", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Friend Gruba katılırken bir hata oluştu." }));
    }
};




export const leaveFriendGroupWebSocket = async (ws, data, broadcastFriendGroupEvent, broadcastToAll) => {
    try {
        const { groupId } = data; 
        const userId = ws.userId; 

        if (!groupId) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Grup ID'si gerekli." }));
        }

        const group = await FriendGroupChat.findById(groupId);
        if (!group) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Friend Grup bulunamadı." }));
        }

        if (!group.members.some(memberId => memberId.toString() === userId)) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Bu Friend grubun üyesi değilsiniz." }));
        }

        group.members = group.members.filter(memberId => memberId.toString() !== userId);

        if (group.members.length === 0) {
            await FriendGroupChat.findByIdAndDelete(groupId);
            if (broadcastFriendGroupEvent) {
                broadcastFriendGroupEvent(groupId, "FRIEND_GROUP_DELETED", { groupId: groupId, reason: "No members left" });
            }
            if (broadcastToAll) {
                broadcastToAll({ 
                    type: "FRIEND_GROUP_DELETED",
                    groupId: groupId,
                });
            }
        } else {
            await group.save();
            const populatedGroup = await FriendGroupChat.findById(groupId)
                .populate({ path: 'hostId', select: 'username name avatar' })
                .populate({ path: 'members', select: 'username name avatar' });

            if (broadcastFriendGroupEvent) {
                broadcastFriendGroupEvent(groupId, "USER_LEFT_FRIEND_GROUP", { groupId: groupId, userId: userId });
            }
            if (broadcastToAll) { 
                broadcastToAll({
                    type: "FRIEND_GROUP_UPDATED",
                    group: formatFriendGroupResponse(populatedGroup),
                    groupId: groupId,
                    userIdLeft: userId
                });
            }
        }

        ws.send(JSON.stringify({ message: "Friend Gruptan başarıyla ayrıldınız.", groupId: groupId, type: "LEAVE_FRIEND_GROUP_SUCCESS" }));

    } catch (error) {
        console.error("Friend Gruptan ayrılma hatası (WebSocket):", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Friend Gruptan ayrılırken bir hata oluştu." }));
    }
};

export const getUserFriendGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await FriendGroupChat.find({
            $or: [{ hostId: userId }, { members: userId }]
        })
            .populate({ path: 'hostId', select: 'username name avatar' })
            .populate({ path: 'members', select: 'username name avatar' });

        res.status(200).json({ groups: groups.map(formatFriendGroupResponse) });

    } catch (error) {
        console.error("Kullanıcı Friend gruplarını listeleme hatası:", error);
        res.status(500).json({ message: "Kullanıcı Friend grupları listelenirken bir hata oluştu." });
    }
};


export const updateFriendGroup = async (req, res, broadcastFriendGroupEvent) => {
    try {
        const { groupId } = req.params;
        const { groupName, description, password, maxMembers } = req.body;
        const userId = req.user._id;

        const group = await FriendGroupChat.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Friend Grup bulunamadı." });
        }
        if (group.hostId.toString() !== userId) {
            return res.status(403).json({ message: "Friend Grubu güncelleme yetkiniz yok." });
        }

        const updateData = {};
        if (groupName) updateData.groupName = groupName;
        if (description) updateData.description = description;
        if (password !== undefined) updateData.password = password;
        if (maxMembers) updateData.maxMembers = maxMembers;


        const updatedGroupDoc = await FriendGroupChat.findByIdAndUpdate(groupId, updateData, { new: true })
            .populate({ path: 'hostId', select: 'username name avatar' })
            .populate({ path: 'members', select: 'username name avatar' });

        if (!updatedGroupDoc) {
            return res.status(500).json({ message: "Friend Grup güncellenirken bir hata oluştu." });
        }
        const updatedGroup = formatFriendGroupResponse(updatedGroupDoc);


        if (broadcastFriendGroupEvent) {
            broadcastFriendGroupEvent(groupId, "FRIEND_GROUP_UPDATED", { groupId: groupId, updatedBy: userId, updates: updateData });
        }
        res.status(200).json({ message: "Friend Grup başarıyla güncellendi.", group: updatedGroup });

    } catch (error) {
        console.error("Friend Grup güncelleme hatası:", error);
        res.status(500).json({ message: "Friend Grup güncellenirken bir hata oluştu." });
    }
};

export const sendFriendGroupMessage = async (ws, data, broadcastFriendGroupMessage) => {
    try {
        const { groupId, message } = data;
        const userId = ws.userId;

        if (!groupId || !message) {
            throw new Error("Geçersiz mesaj verisi");
        }

       
        const newMessage = new FriendGroupChatMessage({
            groupId,
            senderId: userId,
            message,
            timestamp: new Date()
        });
        await newMessage.save();

       
        const populatedMessage = await FriendGroupChatMessage.populate(newMessage, {
            path: 'senderId',
            select: 'username name avatar'
        });

      
        const formattedMessage = {
            _id: populatedMessage._id,
            groupId: populatedMessage.groupId,
            senderId: {
                _id: populatedMessage.senderId._id,
                username: populatedMessage.senderId.username,
                name: populatedMessage.senderId.name,
                avatar: populatedMessage.senderId.avatar,
            },
            message: populatedMessage.message,
            timestamp: populatedMessage.timestamp,
        };

      
        if (broadcastFriendGroupMessage) {
            broadcastFriendGroupMessage(
                groupId,
                "RECEIVE_FRIEND_GROUP_MESSAGE",
                formattedMessage,
                userId.toString()
            );
        }

    } catch (error) {
        console.error("Friend grup mesajı gönderme hatası:", error);
        ws.send(JSON.stringify({
            type: "ERROR",
            message: "Mesaj gönderilirken bir hata oluştu"
        }));
    }
};


export const deleteFriendGroup = async (ws, data, broadcastFriendGroupEvent, broadcastToAll) => {
    try {
        const { groupId } = data;
        const userId = ws.userId;

        if (!groupId) {
            throw new Error("Grup ID'si gerekli.");
        }

        const group = await FriendGroupChat.findById(groupId);
        if (!group) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Friend Grup bulunamadı." }));
        }
        if (group.hostId.toString() !== userId) {
            return ws.send(JSON.stringify({ type: "ERROR", message: "Friend Grubu silme yetkiniz yok. Yalnızca host silebilir." }));
        }

        await FriendGroupChat.findByIdAndDelete(groupId);

        if (broadcastFriendGroupEvent) {
            broadcastFriendGroupEvent(groupId, "FRIEND_GROUP_DELETED", { groupId: groupId, deletedBy: userId });
        }
        if (broadcastToAll) { 
            broadcastToAll({
                type: "FRIEND_GROUP_DELETED",
                groupId: groupId,
            });
        }
        ws.send(JSON.stringify({
            type: "FRIEND_GROUP_DELETED_SUCCESS",
            groupId: groupId,
            message: "Friend Grup başarıyla silindi."
        }));


    } catch (error) {
        console.error("Friend Grup silme hatası (WebSocket):", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Friend Grup silinirken bir hata oluştu." }));
    }
};


export const getFriendGroupChatHistory = async (req, res) => {
    try {
        const { groupId } = req.params;

        const chatHistory = await FriendGroupChatMessage.find({ groupId })
            .populate({
                path: 'senderId',
                select: 'username name avatar'
            })
            .sort({ timestamp: 1 });

        const formattedHistory = chatHistory.map(chatMessage => ({
            _id: chatMessage._id,
            groupId: chatMessage.groupId,
            senderId: {
                _id: chatMessage.senderId._id,
                username: chatMessage.senderId.username,
                name: chatMessage.senderId.name,
                avatar: chatMessage.senderId.avatar,
            },
            message: chatMessage.message,
            timestamp: chatMessage.timestamp,
        }));

        res.status(200).json({ history: formattedHistory });

    } catch (error) {
        console.error("Friend Grup mesaj geçmişi alınırken hata:", error);
        res.status(500).json({ message: "Friend Grup mesaj geçmişi alınırken bir hata oluştu." });
    }
};
export const getFriendGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await FriendGroupChat.findById(groupId)
            .populate({ path: 'hostId', select: 'username name avatar' })
            .populate({ path: 'members', select: 'username name avatar' });

        if (!group) {
            return res.status(404).json({ message: "Friend Grup bulunamadı." });
        }

        res.status(200).json({ group: formatFriendGroupResponse(group) });

    } catch (error) {
        console.error("Friend Grubu ID'ye göre getirme hatası:", error);
        res.status(500).json({ message: "Friend Grubu getirilirken bir hata oluştu." });
    }
};

export const initializeFriendGroupChatWebSocket = ({ broadcastFriendGroupEvent, broadcastToAll, sendToSpecificUser, broadcastFriendGroupMessage, broadcastFriendEvent }) => {
    
};

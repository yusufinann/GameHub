import FriendGroupChat from "../models/friendGroupChat.model.js";
import User from "../models/user.model.js";
import FriendGroupChatMessage from "../models/friendGroupChatMessage.model.js";

let _broadcastFriendEvent;
let _broadcastFriendGroupEvent;
let _broadcastToAll;
let _sendToSpecificUser;
let _broadcastFriendGroupMessage;

export const initializeFriendGroupChatWebSocket = (broadcasters) => {
  _broadcastFriendEvent = broadcasters.broadcastFriendEvent;
  _broadcastFriendGroupEvent = broadcasters.broadcastFriendGroupEvent;
  _broadcastToAll = broadcasters.broadcastToAll;
  _sendToSpecificUser = broadcasters.sendToSpecificUser;
  _broadcastFriendGroupMessage = broadcasters.broadcastFriendGroupMessage;
};

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
    members: group.members.map((member) => ({
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

export const createFriendGroup = async (req, res) => {
  try {
    const { groupName, description, password, maxMembers, invitedFriends } =
      req.body;
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
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    if (
      invitedFriends &&
      Array.isArray(invitedFriends) &&
      invitedFriends.length > 0 &&
      _broadcastFriendEvent
    ) {
      invitedFriends.forEach((friendId) => {
        _broadcastFriendEvent(friendId, {
          type: "FRIEND_GROUP_INVITATION_RECEIVED",
          groupId: populatedGroup._id.toString(),
          groupName: populatedGroup.groupName,
          inviterId: hostId.toString(),
          inviterName: req.user.name,
          inviterUsername: req.user.username,
          invitationLink: newGroup.invitationLink,
        });
      });
    }

    res.status(201).json({
      message: "Arkadaş Grubu başarıyla oluşturuldu",
      group: formatFriendGroupResponse(populatedGroup),
      invitationLink: newGroup.invitationLink,
    });
  } catch (error) {
    console.error("Arkadaş Grubu oluşturma hatası:", error);
    res
      .status(500)
      .json({ message: "Arkadaş Grubu oluşturulurken bir hata oluştu." });
  }
};

export const joinFriendGroupWebSocket = async (ws, data) => {
  try {
    const { groupId, password } = data;
    const userId = ws.userId;
    const user = await User.findById(userId).select("username name avatar");

    if (!groupId) {
      throw new Error("Grup ID'si gerekli.");
    }

    const group = await FriendGroupChat.findById(groupId).populate("members");
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Arkadaş Grubu bulunamadı." })
      );
    }

    if (group.members.length >= group.maxMembers) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Arkadaş Grubu maksimum üye sayısına ulaştı.",
        })
      );
    }

    if (group.password && group.password !== password && password !== null) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Yanlış şifre." })
      );
    }

    if (group.hostId.toString() !== userId) {
      const hostUser = await User.findById(group.hostId).select("friends");
      const hostFriends = hostUser.friends.map((friendId) =>
        friendId.toString()
      );
      if (!hostFriends.includes(userId)) {
        return ws.send(
          JSON.stringify({
            type: "ERROR",
            message:
              "Gruba katılmak için grup kurucusu ile arkadaş olmalısınız.",
          })
        );
      }
    }

    if (group.members.some((member) => member._id.toString() === userId)) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Zaten bu Arkadaş grubunun üyesisiniz.",
        })
      );
    }

    group.members.push(userId);
    await group.save();

    const populatedGroup = await FriendGroupChat.findById(group._id)
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    if (_broadcastFriendGroupEvent) {
      _broadcastFriendGroupEvent(groupId, "USER_JOINED_FRIEND_GROUP", {
        groupId: groupId,
        userId: userId,
        userInfo: {
          _id: user._id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
        },
      });
    }

    if (_broadcastToAll) {
      _broadcastToAll({
        type: "FRIEND_GROUP_UPDATED",
        group: formatFriendGroupResponse(populatedGroup),
        groupId: groupId,
      });
    }

    ws.send(
      JSON.stringify({
        type: "JOIN_FRIEND_GROUP_SUCCESS",
        message: "Arkadaş Grubuna başarıyla katıldınız.",
        group: formatFriendGroupResponse(populatedGroup),
      })
    );
  } catch (error) {
    console.error("Arkadaş Grubuna katılma hatası (WebSocket):", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Arkadaş Grubuna katılırken bir hata oluştu.",
      })
    );
  }
};

export const leaveFriendGroupWebSocket = async (ws, data) => {
  try {
    const { groupId } = data;
    const userId = ws.userId;

    if (!groupId) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup ID'si gerekli." })
      );
    }

    const group = await FriendGroupChat.findById(groupId);
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Arkadaş Grubu bulunamadı." })
      );
    }

    if (!group.members.some((memberId) => memberId.toString() === userId)) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Bu Arkadaş grubunun üyesi değilsiniz.",
        })
      );
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );

    if (group.members.length === 0) {
      await FriendGroupChat.findByIdAndDelete(groupId);
      if (_broadcastFriendGroupEvent) {
        _broadcastFriendGroupEvent(groupId, "FRIEND_GROUP_DELETED", {
          groupId: groupId,
          reason: "Üye kalmadı",
        });
      }
      if (_broadcastToAll) {
        _broadcastToAll({
          type: "FRIEND_GROUP_DELETED",
          groupId: groupId,
        });
      }
    } else {
      await group.save();
      const populatedGroup = await FriendGroupChat.findById(groupId)
        .populate({ path: "hostId", select: "username name avatar" })
        .populate({ path: "members", select: "username name avatar" });

      if (_broadcastFriendGroupEvent) {
        _broadcastFriendGroupEvent(groupId, "USER_LEFT_FRIEND_GROUP", {
          groupId: groupId,
          userId: userId,
        });
      }
      if (_broadcastToAll) {
        _broadcastToAll({
          type: "FRIEND_GROUP_UPDATED",
          group: formatFriendGroupResponse(populatedGroup),
          groupId: groupId,
          userIdLeft: userId,
        });
      }
    }

    ws.send(
      JSON.stringify({
        message: "Arkadaş Grubundan başarıyla ayrıldınız.",
        groupId: groupId,
        type: "LEAVE_FRIEND_GROUP_SUCCESS",
      })
    );
  } catch (error) {
    console.error("Arkadaş Grubundan ayrılma hatası (WebSocket):", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Arkadaş Grubundan ayrılırken bir hata oluştu.",
      })
    );
  }
};

export const getUserFriendGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await FriendGroupChat.find({
      $or: [{ hostId: userId }, { members: userId }],
    })
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    res.status(200).json({ groups: groups.map(formatFriendGroupResponse) });
  } catch (error) {
    console.error("Kullanıcı Arkadaş gruplarını listeleme hatası:", error);
    res
      .status(500)
      .json({
        message: "Kullanıcı Arkadaş grupları listelenirken bir hata oluştu.",
      });
  }
};

export const updateFriendGroup = async (ws, data) => {
  try {
    const { groupId, groupName, description, password, maxMembers } = data;
    const userId = ws.userId;

    if (!groupId) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup ID'si gerekli." })
      );
    }

    const group = await FriendGroupChat.findById(groupId);
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Arkadaş Grubu bulunamadı." })
      );
    }

    if (group.hostId.toString() !== userId) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Arkadaş Grubunu güncelleme yetkiniz yok.",
        })
      );
    }

    const updates = {};
    if (groupName !== undefined && groupName !== group.groupName)
      updates.groupName = groupName;
    if (description !== undefined && description !== group.description)
      updates.description = description;
    if (password !== undefined && password !== "") updates.password = password;
    const newMaxMembers =
      maxMembers !== undefined &&
      maxMembers !== "" &&
      !isNaN(parseInt(maxMembers))
        ? parseInt(maxMembers)
        : undefined;
    if (newMaxMembers !== undefined && newMaxMembers !== group.maxMembers)
      updates.maxMembers = newMaxMembers;
    else if (maxMembers === "" && group.maxMembers !== null)
      updates.maxMembers = null;

    const updatedGroupRaw = await FriendGroupChat.findByIdAndUpdate(
      groupId,
      { $set: updates },
      { new: true }
    );

    if (!updatedGroupRaw) {
      throw new Error("Grup güncellendikten sonra bulunamadı.");
    }

    const updatedGroupPopulated = await FriendGroupChat.findById(
      updatedGroupRaw._id
    )
      .populate("hostId", "username name avatar")
      .populate("members", "username name avatar");
    const groupDataForBroadcast = {
      _id: updatedGroupPopulated._id,
      groupName: updatedGroupPopulated.groupName,
      description: updatedGroupPopulated.description,
      host: {
        _id: updatedGroupPopulated.hostId._id.toString(),
        username: updatedGroupPopulated.hostId.username,
        name: updatedGroupPopulated.hostId.name,
        avatar: updatedGroupPopulated.hostId.avatar,
      },
      members: updatedGroupPopulated.members.map((member) => ({
        _id: member._id.toString(),
        username: member.username,
        name: member.name,
        avatar: member.avatar,
      })),
      maxMembers: updatedGroupPopulated.maxMembers,
      invitationLink: updatedGroupPopulated.invitationLink,
      createdAt: updatedGroupPopulated.createdAt,
      updatedAt: updatedGroupPopulated.updatedAt,
    };

    if (_broadcastFriendGroupEvent) {
      _broadcastFriendGroupEvent(groupId, "FRIEND_GROUP_UPDATED", {
        groupId: groupId,
        updatedBy: userId,
        group: groupDataForBroadcast,
      });
    }

    const formattedResponseForRequester =
      formatFriendGroupResponse(updatedGroupPopulated);

    ws.send(
      JSON.stringify({
        type: "UPDATE_FRIEND_GROUP_SUCCESS",
        message: "Arkadaş Grubu başarıyla güncellendi.",
        group: formattedResponseForRequester,
      })
    );
  } catch (err) {
    console.error("WS Arkadaş Grubu güncelleme hatası:", err);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Arkadaş Grubu güncellenirken bir hata oluştu.",
      })
    );
  }
};

export const sendFriendGroupMessage = async (ws, data) => {
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
      timestamp: new Date(),
    });
    await newMessage.save();

    const populatedMessage = await FriendGroupChatMessage.populate(newMessage, {
      path: "senderId",
      select: "username name avatar",
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

    if (_broadcastFriendGroupMessage) {
      _broadcastFriendGroupMessage(
        groupId,
        "RECEIVE_FRIEND_GROUP_MESSAGE",
        formattedMessage,
        userId.toString()
      );
    }
  } catch (error) {
    console.error("Arkadaş grubu mesajı gönderme hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Mesaj gönderilirken bir hata oluştu",
      })
    );
  }
};

export const deleteFriendGroup = async (ws, data) => {
  try {
    const { groupId } = data;
    const userId = ws.userId;

    if (!groupId) {
      throw new Error("Grup ID'si gerekli.");
    }

    const group = await FriendGroupChat.findById(groupId);
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Arkadaş Grubu bulunamadı." })
      );
    }
    if (group.hostId.toString() !== userId) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Arkadaş Grubunu silme yetkiniz yok. Yalnızca kurucu silebilir.",
        })
      );
    }

    await FriendGroupChat.findByIdAndDelete(groupId);

    if (_broadcastFriendGroupEvent) {
      _broadcastFriendGroupEvent(groupId, "FRIEND_GROUP_DELETED", {
        groupId: groupId,
        deletedBy: userId,
      });
    }
    if (_broadcastToAll) {
      _broadcastToAll({
        type: "FRIEND_GROUP_DELETED",
        groupId: groupId,
      });
    }
    ws.send(
      JSON.stringify({
        type: "FRIEND_GROUP_DELETED_SUCCESS",
        groupId: groupId,
        message: "Arkadaş Grubu başarıyla silindi.",
      })
    );
  } catch (error) {
    console.error("Arkadaş Grubu silme hatası (WebSocket):", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Arkadaş Grubu silinirken bir hata oluştu.",
      })
    );
  }
};

export const getFriendGroupChatHistory = async (req, res) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    if (!groupId) {
      return res.status(400).json({ message: "Arkadaş Grubu ID'si gerekli" });
    }

    const totalMessages = await FriendGroupChatMessage.countDocuments({
      groupId,
    });

    const messages = await FriendGroupChatMessage.find({ groupId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "senderId", select: "username name avatar" });

    const formattedHistory = messages
      .map((chatMessage) => ({
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
      }))
      .reverse();

    res.status(200).json({
      history: formattedHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: totalMessages > skip + messages.length,
      },
    });
  } catch (error) {
    console.error("Arkadaş Grubu mesaj geçmişi alınırken hata:", error);
    res
      .status(500)
      .json({
        message: "Arkadaş Grubu mesaj geçmişi alınırken bir hata oluştu.",
      });
  }
};

export const getFriendGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await FriendGroupChat.findById(groupId)
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    if (!group) {
      return res.status(404).json({ message: "Arkadaş Grubu bulunamadı." });
    }

    res.status(200).json({ group: formatFriendGroupResponse(group) });
  } catch (error) {
    console.error("Arkadaş Grubunu ID'ye göre getirme hatası:", error);
    res
      .status(500)
      .json({ message: "Arkadaş Grubu getirilirken bir hata oluştu." });
  }
};
import GroupChat from "../models/groupChat.model.js";
import User from "../models/user.model.js";
import GroupChatMessage from "../models/groupChatMessage.model.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
export const createGroup = async (ws, data, broadcastToAll) => {
  try {
    const { groupName, description, password, maxMembers } = data;
    const hostId = ws.userId;

    const existingGroup = await GroupChat.findOne({ hostId });
    if (existingGroup) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Her kullanıcı yalnızca bir grup oluşturabilir.",
        })
      );
    }

    let hashedPassword = undefined;

    if (password && password !== null) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    } else {
      console.log("No password provided, hashedPassword will be undefined");
    }

    const newGroup = new GroupChat({
      groupName,
      description,
      hostId,
      members: [hostId],
      password: hashedPassword,
      maxMembers,
    });

    await newGroup.save();

    const populatedGroup = await GroupChat.findById(newGroup._id)
      .select("+password")
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    broadcastToAll({
      type: "GROUP_CREATED",
      group: formatGroupResponse(populatedGroup),
    });
  } catch (error) {
    console.error("Grup oluşturma hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Grup oluşturulurken bir hata oluştu.",
      })
    );
  }
};

export const joinGroup = async (
  ws,
  data,
  broadcastToSender,
  broadcastGroupEvent,
  broadcastToAll
) => {
  try {
    const { groupId, password } = data;
    const userId = ws.userId;

    const group = await GroupChat.findById(groupId)
      .select("+password")
      .populate("members");

    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup bulunamadı." })
      );
    }

    if (group.members.length >= group.maxMembers) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Grup maksimum üye sayısına ulaştı.",
        })
      );
    }

    if (group.password) {
      if (!password) {
        return ws.send(
          JSON.stringify({
            type: "ERROR",
            message: "Bu grup için şifre gerekli.",
          })
        );
      }
      const valid = await bcrypt.compare(password, group.password);
      if (!valid) {
        return ws.send(
          JSON.stringify({ type: "ERROR", message: "Yanlış şifre." })
        );
      }
    } else if (password) {
      console.log(
        "Client sent a password, but this group does not require one."
      );
    }

    if (group.members.some((member) => member._id.toString() === userId)) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Zaten bu grubun üyesisiniz.",
        })
      );
    }

    group.members.push(userId);
    await group.save();

    const populatedGroup = await GroupChat.findById(group._id)
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    broadcastToSender({
      type: "GROUP_JOINED_SUCCESS",
      group: formatGroupResponse(populatedGroup),
    });
    broadcastGroupEvent(groupId, "USER_JOINED_GROUP", {
      groupId: groupId,
      userId: userId,
    });
    broadcastToAll({
      type: "GROUP_JOINED",
      group: formatGroupResponse(populatedGroup),
    });
  } catch (error) {
    console.error("Gruba katılma hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Gruba katılırken bir hata oluştu.",
      })
    );
  }
};

export const leaveGroup = async (
  ws,
  data,
  broadcastToSender,
  broadcastGroupEvent,
  broadcastToAll
) => {
  try {
    const { groupId } = data;
    const userId = ws.userId;

    const group = await GroupChat.findById(groupId)
      .select("+password")
      .populate("members");
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup bulunamadı." })
      );
    }

    group.members = group.members.filter((m) => m._id.toString() !== userId);

    if (group.members.length === 0) {
      await GroupChat.findByIdAndDelete(groupId);
      broadcastGroupEvent(groupId, "GROUP_DELETED", {
        groupId,
        reason: "No members left",
      });
      broadcastToAll({ type: "GROUP_DELETED", groupId });

      broadcastToSender(userId, { type: "GROUP_LEFT_SUCCESS", groupId });

      return;
    }

    if (group.hostId.toString() === userId.toString()) {
      if (group.members.length > 0) {
        const newHostId = group.members[0]._id;
        group.hostId = newHostId;
        broadcastGroupEvent(groupId, "GROUP_HOST_CHANGED", {
          groupId,
          newHostId,
        });
      } else {
        await GroupChat.findByIdAndDelete(groupId);
        broadcastGroupEvent(groupId, "GROUP_DELETED", {
          groupId,
          reason: "Host left and no members left",
        });
        broadcastToAll({ type: "GROUP_DELETED", groupId });
      }
    }

    await group.save();

    broadcastGroupEvent(groupId, "USER_LEFT_GROUP", { groupId, userId });
    broadcastToSender({
      type: "USER_LEFT_GROUP",
      groupId,
      data: { groupId, userId },
    });
    broadcastToAll({
      type: "GROUP_UPDATED",
      group: formatGroupResponse(
        await GroupChat.findById(groupId)
          .select("+password")
          .populate("hostId", "username name avatar")
          .populate("members", "username name avatar")
      ),
      groupId,
      userIdLeft: userId,
    });

    broadcastToSender(userId, { type: "GROUP_LEFT_SUCCESS", groupId });
  } catch (error) {
    console.error("Gruptan ayrılma hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Gruptan ayrılırken bir hata oluştu.",
      })
    );
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const groups = await GroupChat.find({})
      .select("+password")
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });
    res.status(200).json({
      type: "ALL_GROUPS_LIST",
      groups: groups.map(formatGroupResponse),
    });
  } catch (error) {
    console.error("Grupları listeleme hatası:", error);
    res
      .status(500)
      .json({
        type: "ERROR",
        message: "Gruplar listelenirken bir hata oluştu.",
      });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await GroupChat.find({
      $or: [{ hostId: userId }, { members: userId }],
    })
      .select("+password")
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    res.status(200).json({
      type: "USER_GROUPS_LIST",
      groups: groups.map(formatGroupResponse),
    });
  } catch (error) {
    console.error("Kullanıcı gruplarını listeleme hatası:", error);
    res
      .status(500)
      .json({
        type: "ERROR",
        message: "Kullanıcı grupları listelenirken bir hata oluştu.",
      });
  }
};

export const updateGroup = async (
  ws,
  data,
  broadcastToSender,
  broadcastGroupEvent
) => {
  try {
    const { groupId, groupName, description, password, maxMembers } = data;
    const userId = ws.userId;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup bulunamadı." })
      );
    }
    if (group.hostId.toString() !== userId) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Grubu güncelleme yetkiniz yok.",
        })
      );
    }

    const updateData = {};
    if (groupName) updateData.groupName = groupName;
    if (description) updateData.description = description;
    if (password !== undefined) updateData.password = password;
    if (maxMembers) updateData.maxMembers = maxMembers;

    await GroupChat.findByIdAndUpdate(groupId, updateData);

    const updatedGroup = await GroupChat.findById(groupId)
      .populate({ path: "hostId", select: "username name avatar" })
      .populate({ path: "members", select: "username name avatar" });

    broadcastToSender({
      type: "GROUP_UPDATED_SUCCESS",
      group: formatGroupResponse(updatedGroup),
    });
    broadcastGroupEvent(groupId, "GROUP_UPDATED", {
      groupId: groupId,
      updatedBy: userId,
      updates: updateData,
    });
  } catch (error) {
    console.error("Grup güncelleme hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Grup güncellenirken bir hata oluştu.",
      })
    );
  }
};

export const deleteGroup = async (
  ws,
  data,
  broadcastToSender,
  broadcastGroupEvent,
  broadcastToAll
) => {
  try {
    const { groupId } = data;
    const userId = ws.userId;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup bulunamadı." })
      );
    }
    if (group.hostId.toString() !== userId) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grubu silme yetkiniz yok." })
      );
    }

    await GroupChat.findByIdAndDelete(groupId);

    broadcastToSender({ type: "GROUP_DELETED_SUCCESS", groupId: groupId });
    broadcastGroupEvent(groupId, "GROUP_DELETED", {
      groupId: groupId,
      deletedBy: userId,
    });
    broadcastToAll({
      type: "GROUP_DELETED",
      groupId: groupId,
    });
  } catch (error) {
    console.error("Grup silme hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Grup silinirken bir hata oluştu.",
      })
    );
  }
};

export const sendGroupMessage = async (ws, data, broadcastGroupMessage) => {
  try {
    const { groupId, message } = data;
    const senderId = ws.userId;

    const group = await GroupChat.findById(groupId).populate("members");
    if (!group) {
      return ws.send(
        JSON.stringify({ type: "ERROR", message: "Grup bulunamadı." })
      );
    }

    if (!group.members.some((member) => member._id.toString() === senderId)) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Bu gruba mesaj gönderme yetkiniz yok.",
        })
      );
    }

    const senderUser = await User.findById(senderId).select(
      "username name avatar"
    );
    if (!senderUser) {
      return ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Gönderen kullanıcı bulunamadı.",
        })
      );
    }

    const newMessage = new GroupChatMessage({
      groupId: groupId,
      senderId: senderId,
      message: message,
    });
    await newMessage.save();

    const messagePayload = {
      _id: newMessage._id,
      groupId: groupId,
      senderId: {
        _id: senderUser._id,
        username: senderUser.username,
        name: senderUser.name,
        avatar: senderUser.avatar,
      },
      message: message,
      timestamp: newMessage.timestamp,
    };
    broadcastGroupMessage(
      groupId,
      "RECEIVE_GROUP_MESSAGE",
      messagePayload,
      senderId
    );
  } catch (error) {
    console.error("Grup mesajı gönderme hatası:", error);
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Grup mesajı gönderilirken bir hata oluştu.",
      })
    );
  }
};

export const getGroupChatHistory = async (req, res) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Get total count for pagination info
    const totalMessages = await GroupChatMessage.countDocuments({ groupId });

    // Fetch messages with pagination and sort in reverse chronological order
    const messages = await GroupChatMessage.find({ groupId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "senderId", select: "username name avatar" });

    // Format and reverse back to chronological order for display
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
      type: "GROUP_CHAT_HISTORY",
      groupId: groupId,
      history: formattedHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: totalMessages > skip + messages.length,
      },
    });
  } catch (error) {
    console.error("Grup mesaj geçmişi alınırken hata:", error);
    res
      .status(500)
      .json({
        type: "ERROR",
        message: "Grup mesaj geçmişi alınırken bir hata oluştu.",
      });
  }
};

const formatGroupResponse = (group) => {
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
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    hasPassword: !!group.password,
  };
};

export const initializeGroupChatWebSocket = ({
  broadcastGroupEvent,
  broadcastToAll,
  sendToSpecificUser,
  broadcastGroupMessage,
}) => {};

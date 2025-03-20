import PrivateChatMessage from "../models/privateChat.model.js";
import User from "../models/user.model.js";

export const storePrivateMessage = async (senderId, receiverId, message) => {
  try {
    const newMessage = new PrivateChatMessage({ senderId, receiverId, message });
    await newMessage.save();

   
    const populatedMessage = await PrivateChatMessage.findById(newMessage._id)
      .populate({ path: 'senderId', select: 'username name avatar' })
      .populate({ path: 'receiverId', select: 'username name avatar' });

    
    return {
      _id: populatedMessage._id,
      senderId: {
        _id: populatedMessage.senderId._id,
        username: populatedMessage.senderId.username,
        name: populatedMessage.senderId.name,
        avatar: populatedMessage.senderId.avatar,
      },
      receiverId: {
        _id: populatedMessage.receiverId._id,
        username: populatedMessage.receiverId.username,
        name: populatedMessage.receiverId.name,
        avatar: populatedMessage.receiverId.avatar,
      },
      message: populatedMessage.message,
      timestamp: populatedMessage.timestamp,
    };

  } catch (error) {
    console.error("Özel mesaj kaydetme hatası:", error);
    throw error;
  }
};

export const getPrivateChatHistory = async (senderId, receiverId) => {
  try {
    const history = await PrivateChatMessage.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate({ path: 'senderId', select: 'username name avatar' })
      .populate({ path: 'receiverId', select: 'username name avatar' });

    return history.map(msg => ({
      _id: msg._id,
      senderId: {
        _id: msg.senderId._id,
        username: msg.senderId.username,
        name: msg.senderId.name,
        avatar: msg.senderId.avatar,
      },
      receiverId: {
        _id: msg.receiverId._id,
        username: msg.receiverId.username,
        name: msg.receiverId.name,
        avatar: msg.receiverId.avatar,
      },
      message: msg.message,
      timestamp: msg.timestamp,
    }));
  } catch (error) {
    console.error("Özel sohbet geçmişi alınırken hata:", error);
    return [];
  }
};
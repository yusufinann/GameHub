// communityChat.controller.js
import CommunityChatMessage from "../models/communityChat.model.js";
import User from "../models/user.model.js"; // Kullanıcı modelini import et

export const storeCommunityMessage = async (senderId, message) => {
  try {
    const newMessage = new CommunityChatMessage({ senderId, message });
    await newMessage.save();
    // Populate user data before returning
    const populatedMessage = await CommunityChatMessage.findById(newMessage._id)
      .populate({ path: 'senderId', select: 'username name avatar' });
      
    // Format the message for WebSocket consistency
    return {
      _id: populatedMessage._id,
      senderId: populatedMessage.senderId, // **Return the populated senderId object directly**
      message: populatedMessage.message,
      timestamp: populatedMessage.timestamp
    };
  } catch (error) {
    console.error("Topluluk mesajı kaydetme hatası:", error);
    throw error;
  }
};

export const getRecentCommunityChatHistory = async () => {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const history = await CommunityChatMessage.find({
      timestamp: { $gte: twelveHoursAgo },
    })
      .sort({ timestamp: 1 })
      .populate({ path: 'senderId', select: 'username name avatar' });

    // Format the messages consistently
    return history.map(msg => ({
      _id: msg._id,
      senderId: msg.senderId, // **Return the populated senderId object directly**
      message: msg.message,
      timestamp: msg.timestamp
    }));
  } catch (error) {
    console.error("Son 12 saatlik sohbet geçmişi alınırken hata:", error);
    return [];
  }
};

// Yeni HTTP endpoint için controller fonksiyonu
export const getCommunityMessages = async (req, res) => {
  try {
    const history = await getRecentCommunityChatHistory(); // Mevcut fonksiyonu kullan
    res.status(200).json({ history });
  } catch (error) {
    console.error("Topluluk mesajları alınırken hata:", error);
    res.status(500).json({ message: "Topluluk mesajları alınırken bir hata oluştu." });
  }
};
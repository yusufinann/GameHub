import CommunityChatMessage from "../models/communityChat.model.js";
import User from "../models/user.model.js";

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
      senderId: populatedMessage.senderId, // Return the populated senderId object directly
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

    return history.map(msg => ({
      _id: msg._id,
      senderId: msg.senderId, 
      message: msg.message,
      timestamp: msg.timestamp
    }));
  } catch (error) {
    console.error("Son 12 saatlik sohbet geçmişi alınırken hata:", error);
    return [];
  }
};

// Updated HTTP endpoint with pagination
export const getCommunityMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    
    // Option to filter by time range (default to last 12 hours)
    const timeRange = parseInt(req.query.timeRange) || 12; // Hours
    const timeFilter = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    
    // Get total count for pagination info
    const totalMessages = await CommunityChatMessage.countDocuments({
      timestamp: { $gte: timeFilter },
    });
    
    // Fetch messages with pagination and sort
    const messages = await CommunityChatMessage.find({
      timestamp: { $gte: timeFilter },
    })
      .sort({ timestamp: -1 }) // Reverse chronological order initially
      .skip(skip)
      .limit(limit)
      .populate({ path: 'senderId', select: 'username name avatar' });
    
    // Format and reverse back to chronological order for display
    const formattedHistory = messages
      .map(msg => ({
        _id: msg._id,
        senderId: {
          _id: msg.senderId._id,
          username: msg.senderId.username,
          name: msg.senderId.name,
          avatar: msg.senderId.avatar,
        },
        message: msg.message,
        timestamp: msg.timestamp,
      }))
      .reverse();
    
    res.status(200).json({
      history: formattedHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: totalMessages > skip + messages.length
      }
    });
  } catch (error) {
    console.error("Topluluk mesajları alınırken hata:", error);
    res.status(500).json({ message: "Topluluk mesajları alınırken bir hata oluştu.", error: error.message });
  }
};
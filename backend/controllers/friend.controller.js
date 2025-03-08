import User from "../models/user.model.js";

let broadcastFriendEvent = null;

export const initializeFriendWebSocket = (wsHandler) => {
  broadcastFriendEvent = wsHandler;
};

export const handleFriendRequest = async (ws, data) => {
  try {
    const sourceUserId = ws.userId;
    const targetUserId = data.targetUserId;

    const [sourceUser, targetUser] = await Promise.all([
      User.findById(sourceUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Hedef kullanıcı bulunamadı.' }));
    }
    if (sourceUserId === targetUserId) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Kendine arkadaşlık isteği gönderemezsin.' }));
    }
    if (sourceUser.friends.includes(targetUserId)) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Bu kullanıcı zaten arkadaşınız.' }));
    }
    if (targetUser.friendRequests.includes(sourceUserId)) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.' }));
    }
    if (sourceUser.outgoingRequests.includes(targetUserId)) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.' }));
    }

    await Promise.all([
      User.findByIdAndUpdate(targetUserId, { $push: { friendRequests: sourceUserId } }),
      User.findByIdAndUpdate(sourceUserId, { $push: { outgoingRequests: targetUserId } })
    ]);

    if (broadcastFriendEvent) {
      broadcastFriendEvent(targetUserId.toString(), {
        type: 'FRIEND_REQUEST_RECEIVED',
        receiverId: targetUserId,
        sender: {
          id: sourceUser._id,
          name: sourceUser.name,
          username: sourceUser.username,
          avatar: sourceUser.avatar,
        }
      });
    }
    ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlık isteği gönderildi.' }));
  } catch (error) {
    console.error('Friend request error:', error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İşlem sırasında bir hata oluştu.' }));
  }
};

export const handleFriendRequestAccept = async (ws, data) => {
  try {
    const userId = ws.userId;
    const requesterId = data.requesterId;

    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId)
    ]);

    if (!requester) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'İstek gönderen kullanıcı bulunamadı.' }));
    }
    if (!user.friendRequests.includes(requesterId)) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Arkadaşlık isteği bulunamadı.' }));
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { friendRequests: requesterId },
        $addToSet: { friends: requesterId }
      }),
      User.findByIdAndUpdate(requesterId, {
        $pull: { outgoingRequests: userId },
        $addToSet: { friends: userId }
      })
    ]);

    if (broadcastFriendEvent) {
      broadcastFriendEvent(requesterId.toString(), {
        type: 'FRIEND_REQUEST_ACCEPTED',
        receiverId: requesterId,
        acceptedBy: {
          id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        }
      });
      
      broadcastFriendEvent(userId.toString(), {
        type: 'FRIEND_REQUEST_ACCEPTED',
        receiverId: userId,
        acceptedBy: {
          id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        }
      });
    }
    ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlık isteği kabul edildi.' }));
  } catch (error) {
    console.error('Friend request accept error:', error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İşlem sırasında bir hata oluştu.' }));
  }
};

export const handleFriendRequestReject = async (ws, data) => {
  try {
    const userId = ws.userId;
    const requesterId = data.requesterId;

    const [user, requester] = await Promise.all([
      User.findById(userId),
      User.findById(requesterId)
    ]);

    if (!requester) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'İstek gönderen kullanıcı bulunamadı.' }));
    }
    if (!user.friendRequests.includes(requesterId)) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Arkadaşlık isteği bulunamadı.' }));
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, { $pull: { friendRequests: requesterId } }),
      User.findByIdAndUpdate(requesterId, { $pull: { outgoingRequests: userId } })
    ]);

    if (broadcastFriendEvent) {
      broadcastFriendEvent(requesterId.toString(), {
        type: 'FRIEND_REQUEST_REJECTED',
        receiverId: requesterId,
        rejectedBy: {
          id: user._id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        }
      });
    }
    ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlık isteği reddedildi.' }));
  } catch (error) {
    console.error('Friend request reject error:', error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İşlem sırasında bir hata oluştu.' }));
  }
};

export const handleFriendRemove = async (ws, data) => {
  try {
    const userId = ws.userId;
    const friendId = data.friendId;

    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);

    if (!friend) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Arkadaş bulunamadı.' }));
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, { 
        $pull: { 
          friends: friendId,
          outgoingRequests: friendId 
        } 
      }),
      User.findByIdAndUpdate(friendId, { 
        $pull: { 
          friends: userId,
          outgoingRequests: userId 
        } 
      })
    ]);

    if (broadcastFriendEvent) {
      broadcastFriendEvent(friendId.toString(), {
        type: 'FRIEND_REMOVED',
        receiverId: friendId,
        removedBy: user._id
      });
    }
    ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlıktan çıkarma işlemi tamamlandı.' }));
  } catch (error) {
    console.error('Friend remove error:', error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İşlem sırasında bir hata oluştu.' }));
  }
};

export const handleGetFriendList = async (ws) => {
  try {
    const userId = ws.userId;
    const user = await User.findById(userId).populate('friends', 'id name username avatar isOnline');

    if (!user) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Kullanıcı bulunamadı.' }));
    }

    const friendList = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar,
      isOnline: friend.isOnline
    }));
    ws.send(JSON.stringify({ type: 'GET_FRIEND_LIST', friends: friendList }));
  } catch (error) {
    console.error('Get friend list error:', error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İşlem sırasında bir hata oluştu.' }));
  }
};

export const handleGetFriendRequests = async (ws) => {
  try {
    const userId = ws.userId;
    const user = await User.findById(userId)
      .populate('friendRequests', 'id name username avatar')
      .populate('outgoingRequests', 'id name username avatar');

    if (!user) {
      return ws.send(JSON.stringify({ type: 'ERROR', message: 'Kullanıcı bulunamadı.' }));
    }

    const incomingRequests = user.friendRequests.map(requester => ({
      id: requester._id,
      name: requester.name,
      username: requester.username,
      avatar: requester.avatar
    }));

    const outgoingRequests = user.outgoingRequests.map(targetUser => ({
      id: targetUser._id,
      name: targetUser.name,
      username: targetUser.username,
      avatar: targetUser.avatar
    }));

    ws.send(JSON.stringify({ 
      type: 'FRIEND_REQUESTS_LIST', 
      incoming: incomingRequests,
      outgoing: outgoingRequests
    }));
  } catch (error) {
    console.error('Get friend requests error:', error);
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İşlem sırasında bir hata oluştu.' }));
  }
};
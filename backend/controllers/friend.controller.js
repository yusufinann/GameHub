// friend.controller.js
import { users } from "../datas/users.js"; // users: [{ id, name, username, avatar, friends: [], friendRequests: [] }, ...]

let broadcastFriendEvent = null;

/**
 * WebSocket üzerinden arkadaşlık bildirimi yapmak için fonksiyon atanır.
 * wsHandler: (targetUserId, payload) => {}
 */
export const initializeFriendWebSocket = (wsHandler) => {
  broadcastFriendEvent = wsHandler;
};

/**
 * Arkadaşlık isteği gönderme işlemi.
 * Beklenen data: { targetUserId: string }
 */
export const handleFriendRequest = (ws, data) => {
  const sourceUserId = parseInt(ws.userId);
  const targetUserId = parseInt(data.targetUserId);

  const sourceUser = users.find(u => u.id === sourceUserId);
  const targetUser = users.find(u => u.id === targetUserId);

  if (!targetUser) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Hedef kullanıcı bulunamadı.' }));
    return;
  }
  if (sourceUserId === targetUserId) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Kendine arkadaşlık isteği gönderemezsin.' }));
    return;
  }
  if (sourceUser.friends.includes(targetUserId)) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Bu kullanıcı zaten arkadaşınız.' }));
    return;
  }
  if (targetUser.friendRequests.includes(sourceUserId)) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.' }));
    return;
  }
  if (sourceUser.outgoingRequests.includes(targetUserId)) { // Yeni kontrol
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.' }));
    return;
  }

  targetUser.friendRequests.push(sourceUserId);
  // Kaynak kullanıcının gönderilen isteklerine ekle
sourceUser.outgoingRequests.push(targetUserId);

  console.log(`Broadcasting FRIEND_REQUEST_RECEIVED from ${sourceUserId} to ${targetUserId}`);
  // Hedef kullanıcı online ise bildirimi gönderiyoruz. Bildirimde artık "receiverId" kullanılıyor.
  if (broadcastFriendEvent) {
    broadcastFriendEvent(targetUserId.toString(), {
      type: 'FRIEND_REQUEST_RECEIVED',
      receiverId: targetUserId,
      sender: {
        id: sourceUser.id,
        name: sourceUser.name,
        username: sourceUser.username,
        avatar: sourceUser.avatar,
      }
    });
  }
  ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlık isteği gönderildi.' }));
};

/**
 * Arkadaşlık isteğini kabul etme.
 * Beklenen data: { requesterId: string }
 */
export const handleFriendRequestAccept = (ws, data) => {
  const userId = parseInt(ws.userId);
  const requesterId = parseInt(data.requesterId);

  const user = users.find(u => u.id === userId);
  const requester = users.find(u => u.id === requesterId);

  if (!requester) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İstek gönderen kullanıcı bulunamadı.' }));
    return;
  }
  if (!user.friendRequests.includes(requesterId)) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Arkadaşlık isteği bulunamadı.' }));
    return;
  }

  // İsteği kaldır ve her iki tarafı arkadaş listesine ekle
  user.friendRequests = user.friendRequests.filter(id => id !== requesterId);
  if (!user.friends.includes(requesterId)) {
    user.friends.push(requesterId);
  }
  if (!requester.friends.includes(userId)) {
    requester.friends.push(userId);
  }
  requester.outgoingRequests = requester.outgoingRequests.filter(id => id !== userId);

  console.log(`Broadcasting FRIEND_REQUEST_ACCEPTED: user ${userId} accepted requester ${requesterId}`);
  if (broadcastFriendEvent) {
    broadcastFriendEvent(requesterId.toString(), {
      type: 'FRIEND_REQUEST_ACCEPTED',
      receiverId: requesterId,
      acceptedBy: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      }
    });
    // Send to the accepter (Alice) - Create a *separate* new object here
    broadcastFriendEvent(userId.toString(), {  // <--- NEW OBJECT CREATED
      type: 'FRIEND_REQUEST_ACCEPTED',
      receiverId: userId,
      acceptedBy: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      }
    });
  }
  ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlık isteği kabul edildi.' }));
};

/**
 * Arkadaşlık isteğini reddetme.
 * Beklenen data: { requesterId: string }
 */
export const handleFriendRequestReject = (ws, data) => {
  const userId = parseInt(ws.userId);
  const requesterId = parseInt(data.requesterId);

  const user = users.find(u => u.id === userId);
  const requester = users.find(u => u.id === requesterId);

  if (!requester) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'İstek gönderen kullanıcı bulunamadı.' }));
    return;
  }
  if (!user.friendRequests.includes(requesterId)) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Arkadaşlık isteği bulunamadı.' }));
    return;
  }

  user.friendRequests = user.friendRequests.filter(id => id !== requesterId);
  requester.outgoingRequests = requester.outgoingRequests.filter(id => id !== userId);
  console.log(`Broadcasting FRIEND_REQUEST_REJECTED: user ${userId} rejected requester ${requesterId}`);
  if (broadcastFriendEvent) {
    broadcastFriendEvent(requesterId.toString(), {
      type: 'FRIEND_REQUEST_REJECTED',
      receiverId: requesterId,
      rejectedBy: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      }
    });
  }
  ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlık isteği reddedildi.' }));
};

/**
 * Arkadaşlıktan çıkarma.
 * Beklenen data: { friendId: string }
 */
export const handleFriendRemove = (ws, data) => {
  const userId = parseInt(ws.userId);
  const friendId = parseInt(data.friendId);

  const user = users.find(u => u.id === userId);
  const friend = users.find(u => u.id === friendId);

  if (!friend) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Arkadaş bulunamadı.' }));
    return;
  }

  user.friends = user.friends.filter(id => id !== friendId);
  friend.friends = friend.friends.filter(id => id !== userId);
  
  user.outgoingRequests = user.outgoingRequests.filter(id => id !== friendId);
  friend.outgoingRequests = friend.outgoingRequests.filter(id => id !== userId)
  console.log(`Broadcasting FRIEND_REMOVED: user ${userId} removed friend ${friendId}`);
  if (broadcastFriendEvent) {
    broadcastFriendEvent(friendId.toString(), {
      type: 'FRIEND_REMOVED',
      receiverId: friendId,
      removedBy: user.id
    });
  }
  ws.send(JSON.stringify({ type: 'ACK', message: 'Arkadaşlıktan çıkarma işlemi tamamlandı.' }));
};

/**
 * Arkadaş listesini gönderme.
 */
export const handleGetFriendList = (ws) => {
  const userId = parseInt(ws.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Kullanıcı bulunamadı.' }));
    return;
  }
  const friendList = user.friends.map(friendId => {
    const friend = users.find(u => u.id === friendId);
    return friend ? {
      id: friend.id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar
    } : null;
  }).filter(Boolean);

  ws.send(JSON.stringify({ type: 'GET_FRIEND_LIST', friends: friendList }));
};

/**
 * Gelen arkadaşlık isteklerini gönderme.
 */
export const handleGetFriendRequests = (ws) => {
  console.log('Handling GET_FRIEND_REQUESTS for userId:', ws.userId); // Add this
  const userId = parseInt(ws.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Kullanıcı bulunamadı.' }));
    return;
  }
  const incomingRequests  = user.friendRequests.map(requesterId => {
    const requester = users.find(u => u.id === requesterId);
    return requester ? {
      id: requester.id,
      name: requester.name,
      username: requester.username,
      avatar: requester.avatar
    } : null;
  }).filter(Boolean);

    // Giden istekler (Yeni eklenen kısım)
    const outgoingRequests = user.outgoingRequests.map(targetUserId => {
      const targetUser = users.find(u => u.id === targetUserId);
      return targetUser ? {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        avatar: targetUser.avatar
      } : null;
    }).filter(Boolean);
  
    ws.send(JSON.stringify({ 
      type: 'FRIEND_REQUESTS_LIST', 
      incoming: incomingRequests,
      outgoing: outgoingRequests  
    }));
};


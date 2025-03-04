import { WebSocketServer } from 'ws';
import { handleFriendRemove, handleFriendRequest, handleFriendRequestAccept, handleFriendRequestReject, handleGetFriendList, handleGetFriendRequests } from '../controllers/friend.controller.js';
import * as bingoGameController from '../controllers/bingo.game.controller.js';
// Aktif bağlantıları kullanıcı ID'siyle saklamak için Map kullanıyoruz
const connectedClients = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  const pingInterval = setInterval(() => {
    connectedClients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log('Bağlantı aktif değil, sonlandırılıyor:', ws.userId);
        return ws.terminate();
      }
      ws.isAlive = false;
      if (ws.readyState === ws.OPEN) {
        ws.ping((err) => {
          if (err) console.error('Ping gönderim hatası:', err);
        });
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  wss.on('connection', (ws, request) => {
    console.log('Yeni bir istemci bağlandı.');
    ws.isAlive = true;

    try {
      // URL query parametresinden userId alınır
      const userId = new URL(request.url, 'http://localhost').searchParams.get('userId');
      if (userId) {
        ws.userId = userId;
        connectedClients.set(userId, ws);
        console.log(`Client connected with userId: ${userId}`);
      } else {
        console.log('No userId provided in connection');
      }
    } catch (error) {
      console.error('Error parsing userId from connection URL:', error);
    }

    ws.on('pong', () => {
      ws.isAlive = true;
      console.log('Pong alındı: Bağlantı aktif.', ws.userId);
    });

    ws.on('message', (message) => handleMessage(ws, message));

    ws.on('close', () => {
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          connectedClients.delete(userId);
          console.log(`Client disconnected: ${userId}`);
          break;
        }
      }
      console.log('İstemci bağlantısı kesildi.');
    });

    ws.on('error', (error) => {
      console.error('WebSocket hatası:', error);
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          connectedClients.delete(userId);
          console.log(`Client removed due to error: ${userId}`);
          break;
        }
      }
    });
  });

  // Gelen mesajları yönlendiriyoruz
  const handleMessage = (ws, message) => {
    try {
      const data = JSON.parse(message);
      console.log('İstemciden gelen mesaj:', data);

      // Mesaj türüne göre yönlendirme yapıyoruz:
      switch (data.type) {
          case 'FRIEND_REQUEST':
            handleFriendRequest(ws, data); // <--- Call handleFriendRequest HERE!
            break;
          case 'FRIEND_REQUEST_ACCEPT':
            handleFriendRequestAccept(ws, data); // <--- Call handleFriendRequestAccept HERE!
            break;
          case 'FRIEND_REQUEST_REJECT':
            handleFriendRequestReject(ws, data); // <--- Call handleFriendRequestReject HERE!
            break;
          case 'FRIEND_REMOVE':
            handleFriendRemove(ws, data); // <--- Call handleFriendRemove HERE!
            break;
          case 'GET_FRIEND_LIST':
            handleGetFriendList(ws); // <--- Call handleGetFriendList HERE!
            break;
          case 'GET_FRIEND_REQUESTS':
            handleGetFriendRequests(ws); // <--- Call handleGetFriendRequests HERE!
            break;
      
        // Diğer mesaj tipleri (lobby, kullanıcı vs.)
        case 'LOBBY_CREATED':
          broadcastToOthers(ws, { type: 'LOBBY_CREATED', data: data.data });
          break;
        case 'USER_JOINED':
          broadcastToOthers(ws, { type: 'USER_JOINED', lobbyCode: data.lobbyCode, data: data.data });
          break;
        case 'USER_LEFT':
          broadcastToOthers(ws, { type: 'USER_LEFT', lobbyCode: data.lobbyCode, data: data.data });
          break;
        case 'LOBBY_DELETED':
          broadcastToOthers(ws, { type: 'LOBBY_DELETED', lobbyCode: data.lobbyCode });
          break;
        case 'LOBBY_REMOVED':
          broadcastToAll({ type: 'LOBBY_REMOVED', lobbyCode: data.lobbyCode, reason: data.reason });
          break;
        case 'USER_STATUS':
          broadcastToAll({ type: 'USER_STATUS', status: data.status, userId: data.userId });
          break;

           // Tombala (Bingo) ile ilgili mesajlar:
      case 'BINGO_JOIN':
        // Kullanıcı oyuna katılmak istiyor
        bingoGameController.joinGame(ws, data);
        break;
      case 'BINGO_START':
        // Oyunu başlatmak istiyor (host tarafından)
        bingoGameController.startGame(ws, data);
        break;
      case 'BINGO_DRAW':
        // Yeni numara çekme isteği
        bingoGameController.drawNumber(ws, data);
        break;
      case 'BINGO_CALL':
        // Kullanıcı bingo dediğinde kontrol et
        bingoGameController.checkBingo(ws, data);
        break;
        case 'BINGO_MARK_NUMBER':
  // Kullanıcının işaretlediği numarayı kaydet
  bingoGameController.markNumber(ws, data);
  break;

        default:
          console.log('Bilinmeyen mesaj tipi:', data.type);
      }
      sendAcknowledgement(ws, data);
    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Mesaj işlenirken bir hata oluştu.' }));
    }
  };

  const broadcastToOthers = (sender, data) => {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client !== sender && client.readyState === client.OPEN) {
        client.send(message, (err) => {
          if (err) console.error('Mesaj gönderimi hatası:', err);
        });
      }
    });
  };

  const sendAcknowledgement = (ws, originalMessage) => {
    const ack = {
      type: 'ACKNOWLEDGEMENT',
      messageType: originalMessage.type,
      timestamp: new Date().toISOString()
    };
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(ack), (err) => {
        if (err) console.error('ACK gönderimi hatası:', err);
      });
    }
  };

  const broadcastToAll = (data) => {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message, (err) => {
          if (err) console.error('Mesaj gönderimi hatası:', err);
        });
      }
    });
  };

  const broadcastToSpecificUsers = (userIds, data) => {
    const message = JSON.stringify(data);
    userIds.forEach(userId => {
      const clientWs = connectedClients.get(userId.toString());
      if (clientWs && clientWs.readyState === clientWs.OPEN) {
        clientWs.send(message, (err) => {
          if (err) console.error('Message sending error:', err);
        });
      }
    });
  };

  // Lobby bildirimleri için broadcast fonksiyonu
  const broadcastLobbyEvent = (lobbyCode, eventType, data, specificUserIds = null) => {
    const message = { type: eventType, lobbyCode, data };
    if (!specificUserIds) {
      broadcastToAll(message);
      return;
    }
    if (Array.isArray(specificUserIds)) {
      broadcastToSpecificUsers(specificUserIds, message);
    } else {
      broadcastToAll(message);
    }
  };

  // Arkadaşlık (friend) bildirimleri için ayrı broadcast fonksiyonu: payload'u direkt gönderiyoruz.
  const broadcastFriendEvent = (targetUserId, payload) => {
    const clientWs = connectedClients.get(targetUserId.toString());
    if (clientWs && clientWs.readyState === clientWs.OPEN) {
      clientWs.send(JSON.stringify(payload));
    }
  };

  console.log('WebSocket sunucusu başlatıldı.');

  return {
    broadcastLobbyEvent,
    broadcastFriendEvent,
    broadcastToAll,
    getConnectedClientsCount: () => connectedClients.size,
  };
};

export default setupWebSocket;

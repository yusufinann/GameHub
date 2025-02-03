import { WebSocketServer } from 'ws';

// WebSocket bağlantılarını saklamak için bir küme (Set) oluştur
const connectedClients = new Set();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  // WebSocket olaylarını işle
  const handleSocketEvents = (ws) => {
    console.log('Yeni bir istemci bağlandı.');
    connectedClients.add(ws);

    // Ping-Pong mekanizması kurulumu
    setupPingPong(ws);

    // Mesaj dinleyicisi
    ws.on('message', (message) => handleMessage(ws, message));

    // Bağlantı kapanma dinleyicisi
    ws.on('close', () => handleClose(ws));

    // Hata dinleyicisi
    ws.on('error', (error) => handleError(ws, error));
  };

  // Ping-Pong mekanizması
  const setupPingPong = (ws) => {
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on('pong', () => {
      console.log('Pong alındı: Bağlantı aktif.');
    });

    // Interval'i temizlemek için close event'ine kaydet
    ws.pingInterval = interval;
  };

  // Mesaj işleme fonksiyonu
  const handleMessage = (ws, message) => {
    try {
      const data = JSON.parse(message);
      console.log('İstemciden gelen mesaj:', data);

      switch (data.type) {
        case 'LOBBY_CREATED':
          broadcastToOthers(ws, {
            type: 'LOBBY_CREATED',
            data: data.data
          });
          break;

        case 'USER_JOINED':
          broadcastToOthers(ws, {
            type: 'USER_JOINED',
            lobbyCode: data.lobbyCode,
            data: data.data
          });
          break;

        case 'USER_LEFT':
          broadcastToOthers(ws, {
            type: 'USER_LEFT',
            lobbyCode: data.lobbyCode,
            data: data.data
          });
          break;

        case 'LOBBY_DELETED':
          broadcastToOthers(ws, {
            type: 'LOBBY_DELETED',
            lobbyCode: data.lobbyCode
          });
          break;

        default:
          console.log('Bilinmeyen mesaj tipi:', data.type);
      }

      // Mesajın alındığına dair onay gönder
      sendAcknowledgement(ws, data);

    } catch (error) {
      console.error('Mesaj işleme hatası:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Mesaj işlenirken bir hata oluştu.'
      }));
    }
  };

  // Bağlantı kapanma işleyicisi
  const handleClose = (ws) => {
    console.log('İstemci bağlantısı kesildi.');
    connectedClients.delete(ws);
    if (ws.pingInterval) {
      clearInterval(ws.pingInterval);
    }
  };

  // Hata işleyicisi
  const handleError = (ws, error) => {
    console.error('WebSocket hatası:', error);
    connectedClients.delete(ws);
    if (ws.pingInterval) {
      clearInterval(ws.pingInterval);
    }
  };

  // Diğer istemcilere yayın yapma
  const broadcastToOthers = (sender, data) => {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client !== sender && client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  };

  // Mesaj alındı onayı gönderme
  const sendAcknowledgement = (ws, originalMessage) => {
    ws.send(JSON.stringify({
      type: 'ACKNOWLEDGEMENT',
      messageType: originalMessage.type,
      timestamp: new Date().toISOString()
    }));
  };

  // Tüm istemcilere yayın yapma
  const broadcastToAll = (data) => {
    const message = JSON.stringify(data);
    connectedClients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  };

  // WebSocket sunucusunu başlat
  wss.on('connection', handleSocketEvents);
  console.log('WebSocket sunucusu başlatıldı.');

  // Dışa aktarılan metodlar
  return {
    broadcastLobbyEvent: (lobbyCode, eventType, data) => {
      broadcastToAll({
        type: eventType,
        lobbyCode,
        data
      });
    },
    broadcastToAll,
    getConnectedClientsCount: () => connectedClients.size
  };
};

export default setupWebSocket;
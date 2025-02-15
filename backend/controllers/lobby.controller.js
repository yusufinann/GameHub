//lobby.controller.js
import bcrypt from 'bcrypt';

let lobbies = [];
const lobbyTimers = new Map();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// WebSocket broadcast fonksiyonu için global değişken
let broadcastLobbyEvent;

// WebSocket fonksiyonunu initialize etmek için
export const initializeWebSocket = (wsHandler) => {
  broadcastLobbyEvent = wsHandler;
};
// Lobi ID'si ve kodu oluşturma fonksiyonları

const generateLobbyId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };
  
  const generateLobbyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };
  
export const getLobbies = (req, res) => {
  const { eventType, hasPassword } = req.query;
  let filteredLobbies = lobbies;

  // Etkinlik lobisi filtresi
  if (eventType) {
    filteredLobbies = filteredLobbies.filter(
      (lobby) => lobby.lobbyType === eventType
    );
  }

  // Şifreli lobi filtresi
  if (hasPassword === "true") {
    filteredLobbies = filteredLobbies.filter(
      (lobby) => lobby.password !== null
    );
  } else if (hasPassword === "false") {
    filteredLobbies = filteredLobbies.filter(
      (lobby) => lobby.password === null
    );
  }

  // Aktif lobileri filtrele
  filteredLobbies = filteredLobbies.filter((lobby) => {
    if (lobby.lobbyType === "event") {
      // Etkinlik lobileri bitiş zamanına kadar aktif
      return new Date(lobby.endTime) > new Date();
    } else {
      // Normal lobiler expiryTime'a kadar aktif
      return lobby.isActive;
    }
  });

  // Başarılı yanıt
  res.status(200).json({
    message: "Lobiler başarıyla getirildi.",
    lobbies: filteredLobbies,
  });
};

export const getLobbyByCode = (req, res) => {
  const { lobbyCode } = req.params;
  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: "Lobi bulunamadı." });
  }

  // Üyelerin bilgilerini dahil et (şifre gibi hassas bilgileri hariç tut)
  const membersWithDetails = lobby.members.map((member) => {
    return {
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      isHost: member.id === lobby.createdBy,
    };
  });

  // Lobi bilgilerini ve üyelerin detaylarını gönder
  res.status(200).json({
    message: "Lobi bilgileri başarıyla getirildi.",
    lobby: {
      ...lobby,
      members: membersWithDetails,
      password: undefined, // Şifreyi göndermeyin
    },
  });
};
export const createLobby = (req, res) => {
  const {
    lobbyName,
    lobbyType,
    startTime,
    endTime,
    password,
    game,
    maxMembers,
  } = req.body;
  const user = req.user;

  // Kullanıcının zaten bir lobisi olup olmadığını kontrol et
  const existingLobby = lobbies.find((lobby) => lobby.createdBy === user.id);
  if (existingLobby) {
    return res.status(400).json({
      message: "You already have one lobby. You cannot create more than one lobby.",
    });
  }

  // Gerekli alanların kontrolü
  if (!lobbyName.trim() || !lobbyType || !game || !maxMembers || maxMembers <= 0) {
    return res.status(400).json({
      message: "Lobby name, type, game and max members are mandatory. Max members must be at least 1.",
    });
  }

  // Etkinlik lobisi için başlangıç ve bitiş zamanı kontrolü
  if (lobbyType === "event") {
    if (!startTime || !endTime) {
      return res.status(400).json({
        message: "The start and end time for the event lobby is mandatory.",
      });
    }

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    if (startTimeDate >= endTimeDate) {
      return res.status(400).json({ 
        message: "The start time must be before the end time." 
      });
    }

    // Geçmiş bir tarih girilip girilmediğini kontrol et
    const now = new Date();
    if (startTimeDate < now) {
      return res.status(400).json({ 
        message: "The start time must be in the future." 
      });
    }
  }

  // Şifreyi hash'le
  const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

  // Yeni lobi oluştur
  const newLobby = {
    id: generateLobbyId(),
    createdBy: user.id,
    lobbyName,
    lobbyType,
    startTime: lobbyType === "event" ? new Date(startTime).toISOString() : null,
    endTime: lobbyType === "event" ? new Date(endTime).toISOString() : null,
    password: hashedPassword,
    game,
    maxMembers,
    createdAt: new Date(),
    members: [
      {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: true,
      },
    ],
    lobbyCode: generateLobbyCode(),
    isActive: true,
    expiryTime: null,
  };

  // Event tipi lobi için zamanlayıcıları ayarla
  if (lobbyType === "event") {
    const startTimeMs = new Date(startTime).getTime();
    const endTimeMs = new Date(endTime).getTime();
    const now = Date.now();

    // Event başlangıç zamanı için timer
    if (startTimeMs > now) {
      const startTimer = setTimeout(() => {
        const currentLobby = lobbies.find(l => l.id === newLobby.id);
        if (currentLobby) {
          const memberIds = currentLobby.members.map(member => member.id);
          
          broadcastLobbyEvent(newLobby.lobbyCode, "EVENT_START_NOTIFICATION", {
            lobbyId: newLobby.id,
            lobbyName: newLobby.lobbyName,
            lobbyCode: newLobby.lobbyCode,
            message: `Event "${newLobby.lobbyName}" has started!`,
            game: newLobby.game,
            startTime: newLobby.startTime,
            endTime: newLobby.endTime
          }, memberIds);
        }
      }, startTimeMs - now);
      
      lobbyTimers.set(`start_${newLobby.id}`, startTimer);
    }

    const endTimer = setTimeout(() => {
      const currentLobby = lobbies.find(l => l.id === newLobby.id);
      if (currentLobby) {
        // Tüm kullanıcılara lobinin silindiğini bildir
        broadcastLobbyEvent(
          newLobby.lobbyCode,
          "LOBBY_REMOVED", // Özel event tipi
          {
            lobbyCode: newLobby.lobbyCode,
            reason: "Event ended",
            lobbyId: currentLobby.id
          },
          null // Tüm kullanıcılara gönder
        );
    
        // Lobi verisini temizle
        const index = lobbies.findIndex((l) => l.id === currentLobby.id);
        if (index !== -1) lobbies.splice(index, 1);
      }
    }, endTimeMs - now)

    lobbyTimers.set(`end_${newLobby.id}`, endTimer);
  }

  // Lobiyi listeye ekle
  lobbies.push(newLobby);

  // WebSocket üzerinden lobi oluşturma olayını yayınla
  broadcastLobbyEvent(newLobby.lobbyCode, "LOBBY_CREATED", newLobby);

  // Başarılı yanıt
  res.status(201).json({
    message: "Lobi başarıyla oluşturuldu.",
    lobby: newLobby,
    lobbyLink: `${FRONTEND_URL}/lobby/${newLobby.lobbyCode}`,
    members: newLobby.members,
  });
};
export const joinLobby = (req, res) => {
  const { lobbyCode } = req.params;
  const { password } = req.body;
  const user = req.user;

  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: "Lobi bulunamadı." });
  }

  // Şifre kontrolü
  if (lobby.password && !bcrypt.compareSync(password, lobby.password)) {
    return res.status(401).json({ message: "Geçersiz şifre." });
  }

  // Host geri dönüş senaryosu
  if (user.id === lobby.createdBy) {
    const hostReturnTimerKey = `host_leave_${lobby.id}`;
    const existingTimer = lobbyTimers.get(hostReturnTimerKey);

    if (existingTimer) {
      // Timer varsa iptal et ve sil
      clearTimeout(existingTimer);
      lobbyTimers.delete(hostReturnTimerKey);

      // Host'u tekrar host olarak ekle
      const hostMemberIndex = lobby.members.findIndex(
        (member) => member.id === user.id
      );
      if (hostMemberIndex !== -1) {
        lobby.members[hostMemberIndex].isHost = true;
      } else {
        lobby.members.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isHost: true,
        });
      }

      // Host'un geri döndüğünü bildir
      broadcastLobbyEvent(lobbyCode, "HOST_RETURNED", {
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        lobbyCode: lobbyCode,
        isHost: true, // Explicitly set host status
      });

      return res.status(200).json({
        message: "Lobiye host olarak geri döndünüz.",
        lobby,
      });
    }
  }

  // Normal katılım kontrolleri
  if (lobby.maxMembers && lobby.members.length >= lobby.maxMembers) {
    return res.status(400).json({ message: "Lobi dolu." });
  }

  const isUserAlreadyInLobby = lobby.members.some(
    (member) => member.id === user.id
  );
  if (isUserAlreadyInLobby) {
    return res.status(400).json({ message: "Zaten bu lobidesiniz." });
  }

  // Kullanıcıyı lobiye ekle
  lobby.members.push({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    isHost: false,
  });

  // Katılım olayını bildir
  broadcastLobbyEvent(lobbyCode, "USER_JOINED", {
    userId: user.id,
    userName: user.name,
    avatar: user.avatar,
  });

  res.status(200).json({
    message: "Lobiye başarıyla katıldınız.",
    lobby,
  });
};
export const leaveLobby = (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  // Lobi bul
  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: "Lobi bulunamadı." });
  }

  // Kullanıcı lobide mi?
  const userIndex = lobby.members.findIndex((member) => member.id === user.id);
  if (userIndex === -1) {
    return res.status(400).json({ message: "Bu lobide değilsiniz." });
  }

  // Kullanıcıyı lobiden çıkar
  const removedUser = lobby.members.splice(userIndex, 1)[0];

  // WebSocket üzerinden üye çıkış olayını yayınla
  broadcastLobbyEvent(lobbyCode, "USER_LEFT", {
    userId: removedUser.id,
    userName: removedUser.name,
  });

  // Lobi otomatik silme kontrolü
  const checkAndCleanLobby = () => {
    const lobbyIndex = lobbies.findIndex((l) => l.lobbyCode === lobbyCode);
    if (lobbyIndex !== -1) {
      lobbies.splice(lobbyIndex, 1);
      broadcastLobbyEvent(lobbyCode, "LOBBY_EXPIRED", {
        reason: "Lobi otomatik olarak silindi",
      });
    }
  };

  // 1. Durum: Tüm üyeler çıktıysa anında sil
  if (lobby.members.length === 0) {
    checkAndCleanLobby();
    return res.status(200).json({
      message: "Son kullanıcı çıktı, lobi silindi",
      lobby: null,
    });
  }

  // 2. Durum: Host çıkışı (sadece normal lobilerde)
  if (removedUser.id === lobby.createdBy && lobby.lobbyType === "normal") {
    const timerKey = `host_leave_${lobby.id}`;

    // Varolan zamanlayıcıyı temizle
    const existingTimer = lobbyTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      lobbyTimers.delete(timerKey);
    }

    // Yeni zamanlayıcı oluştur
    const deletionTimer = setTimeout(() => {
      // Tüm üyelere çıkış bildirimi yap
      lobby.members.forEach((member) => {
        broadcastLobbyEvent(lobbyCode, "USER_KICKED", {
          userId: member.id,
          reason: "Host geri dönmediği için lobi dağıtıldı",
        });
      });

      checkAndCleanLobby();
    }, 60 * 1000); // 1 dakika

    lobbyTimers.set(timerKey, deletionTimer);

    // Yeni host bilgisini yayınla
    const newHost = lobby.members[0];
    lobby.createdBy = newHost?.id;
    broadcastLobbyEvent(lobbyCode, "NEW_HOST", {
      newHostId: newHost?.id,
    });
  }

  // Başarılı yanıt
  res.status(200).json({
    message: "Lobiden başarıyla çıkıldı",
    lobby: {
      ...lobby,
      members: lobby.members.map((m) => ({ id: m.id, name: m.name })),
    },
  });
};

export const deleteLobby = (req, res) => {
    const { lobbyCode } = req.params;
    const user = req.user;
  
    // Lobi bul
    const lobbyIndex = lobbies.findIndex(
      (lobby) => lobby.lobbyCode === lobbyCode
    );
  
    if (lobbyIndex === -1) {
      return res.status(404).json({ message: "Lobi bulunamadı." });
    }
  
    const lobby = lobbies[lobbyIndex];
  
    // Lobiyi silme yetkisi kontrolü
    if (lobby.createdBy !== user.id) {
      return res.status(403).json({ message: "Bu lobiyi silme yetkiniz yok." });
    }
  
    // Lobiyi diziden sil
    lobbies.splice(lobbyIndex, 1);
  
    // WebSocket üzerinden lobi silme olayını yayınla
    broadcastLobbyEvent(lobbyCode, "LOBBY_DELETED", null);
  
    // Başarılı yanıt
    res.status(200).json({
      message: "Lobi başarıyla silindi.",
      deletedLobby: lobby,
    });
  };
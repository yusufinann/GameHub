//lobby.controller.js
import bcrypt from 'bcrypt';
import Lobby from '../models/lobby.model.js'; // Lobby modelini import et
import { bingoGames } from "./bingo.game.controller.js";
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

export const getLobbies = async (req, res) => {
  try {
    const { eventType, hasPassword } = req.query;
    let query = {};

    // Etkinlik lobisi filtresi
    if (eventType) {
      query.lobbyType = eventType;
    }

    // Şifreli lobi filtresi
    if (hasPassword === "true") {
      query.password = { $ne: null };
    } else if (hasPassword === "false") {
      query.password = null;
    }

    // Aktif lobileri filtrele
    query.isActive = true;
    query.$or = [
      { lobbyType: "normal" },
      { lobbyType: "event", endTime: { $gt: new Date() } },
    ];

    const filteredLobbies = await Lobby.find(query).lean(); // .lean() for faster read operations

    // Başarılı yanıt
    res.status(200).json({
      message: "Lobiler başarıyla getirildi.",
      lobbies: filteredLobbies,
    });
  } catch (error) {
    console.error("Lobi getirme hatası:", error);
    res.status(500).json({ message: "Lobiler getirilirken bir hata oluştu.", error: error.message });
  }
};

export const getLobbyByCode = async (req, res) => {
  try {
    const { lobbyCode } = req.params;
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode }).lean();

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
  } catch (error) {
    console.error("Lobi kodu ile getirme hatası:", error);
    res.status(500).json({ message: "Lobi bilgileri getirilirken bir hata oluştu.", error: error.message });
  }
};

export const createLobby = async (req, res) => {
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

  try {
    // Kullanıcının zaten bir lobisi olup olmadığını kontrol et
    const existingLobby = await Lobby.findOne({ createdBy: user.id });
    if (existingLobby) {
      return res.status(400).json({
        message: "Zaten bir lobiniz var. Birden fazla lobi oluşturamazsınız.",
      });
    }

    // Gerekli alanların kontrolü
    if (!lobbyName.trim() || !lobbyType || !game || !maxMembers || maxMembers <= 0) {
      return res.status(400).json({
        message: "Lobi adı, türü, oyun ve maksimum üye sayısı zorunludur. Maksimum üye sayısı en az 1 olmalıdır.",
      });
    }

    // Etkinlik lobisi için başlangıç ve bitiş zamanı kontrolü
    if (lobbyType === "event") {
      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Etkinlik lobisi için başlangıç ve bitiş zamanı zorunludur.",
        });
      }

      const startTimeDate = new Date(startTime);
      const endTimeDate = new Date(endTime);

      if (startTimeDate >= endTimeDate) {
        return res.status(400).json({
          message: "Başlangıç zamanı, bitiş zamanından önce olmalıdır.",
        });
      }

    //Geçmiş bir tarih girilip girilmediğini kontrol et
      const now = new Date();
      if (startTimeDate < now) {
        return res.status(400).json({
          message: "Başlangıç zamanı gelecekte olmalıdır.",
        });
      }
    }

    // Şifreyi hash'le
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

    const lobbyId = generateLobbyId();
    const lobbyCode = generateLobbyCode();

    // Yeni lobi oluştur
    const newLobby = new Lobby({
      id: lobbyId,
      createdBy: user.id,
      lobbyName,
      lobbyType,
      startTime: lobbyType === "event" ? new Date(startTime) : null,
      endTime: lobbyType === "event" ? new Date(endTime) : null,
      password: hashedPassword,
      game,
      maxMembers,
      members: [{
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: true,
      }],
      lobbyCode: lobbyCode,
      isActive: true,
      expiryTime: null,
    });

    // Event tipi lobi için zamanlayıcıları ayarla
    if (lobbyType === "event") {
      const startTimeMs = new Date(startTime).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const now = Date.now();

      // Event başlangıç zamanı için timer
      if (startTimeMs > now) {
        const startTimer = setTimeout(async () => {
          try {
            const currentLobby = await Lobby.findOne({ id: lobbyId }).lean();
            if (currentLobby) {
              const memberIds = currentLobby.members.map(member => member.id);

              broadcastLobbyEvent(lobbyCode, "EVENT_START_NOTIFICATION", {
                lobbyId: lobbyId,
                lobbyName: lobbyName,
                lobbyCode: lobbyCode,
                message: `Event "${lobbyName}" has started!`,
                game: game,
                startTime: startTime,
                endTime: endTime
              }, memberIds);
            }
          } catch (error) {
            console.error("Event start timer error:", error);
          }
        }, startTimeMs - now);

        lobbyTimers.set(`start_${lobbyId}`, startTimer);
      }

      const endTimer = setTimeout(async () => {
        try {
          const currentLobby = await Lobby.findOne({ id: lobbyId }).lean();
          if (currentLobby) {
            // Tüm kullanıcılara lobinin silindiğini bildir
            broadcastLobbyEvent(
              lobbyCode,
              "LOBBY_REMOVED", // Özel event tipi
              {
                lobbyCode: lobbyCode,
                reason: "Event ended",
                lobbyId: currentLobby.id
              },
              null // Tüm kullanıcılara gönder
            );

            // Lobi verisini sil
            await Lobby.deleteOne({ id: currentLobby.id });
          }
        } catch (error) {
          console.error("Event end timer error:", error);
        }
      }, endTimeMs - now)

      lobbyTimers.set(`end_${lobbyId}`, endTimer);
    }

    // Lobiyi veritabanına kaydet
    await newLobby.save();

    // WebSocket üzerinden lobi oluşturma olayını yayınla
    broadcastLobbyEvent(lobbyCode, "LOBBY_CREATED", newLobby.toObject()); // Mongoose objesini düz objeye çevir

    // Başarılı yanıt
    res.status(201).json({
      message: "Lobi başarıyla oluşturuldu.",
      lobby: newLobby.toObject(), // Mongoose objesini düz objeye çevir
      lobbyLink: `${FRONTEND_URL}/lobby/${lobbyCode}`,
      members: newLobby.members,
    });
  } catch (error) {
    console.error("Lobi oluşturma hatası:", error);
    res.status(500).json({ message: "Lobi oluşturulurken bir hata oluştu.", error: error.message });
  }
};

export const joinLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const { password } = req.body;
  const user = req.user;

  try {
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });

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
        await lobby.save();

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
          lobby: lobby.toObject(),
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
    await lobby.save();

    // Katılım olayını bildir
    broadcastLobbyEvent(lobbyCode, "USER_JOINED", {
      userId: user.id,
      userName: user.name,
      avatar: user.avatar,
    });

    res.status(200).json({
      message: "Lobiye başarıyla katıldınız.",
      lobby: lobby.toObject(),
    });
  } catch (error) {
    console.error("Lobiye katılma hatası:", error);
    res.status(500).json({ message: "Lobiye katılırken bir hata oluştu.", error: error.message });
  }
};

export const leaveLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  try {
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });

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
    await lobby.save();

    // WebSocket üzerinden üye çıkış olayını yayınla
    broadcastLobbyEvent(lobbyCode, "USER_LEFT", {
      userId: removedUser.id,
      userName: removedUser.name,
    });

    // Lobi otomatik silme kontrolü
    const checkAndCleanLobby = async () => {
      try {
        const lobbyToDelete = await Lobby.findOne({ lobbyCode: lobbyCode });
        if (lobbyToDelete) {
          await Lobby.deleteOne({ lobbyCode: lobbyCode });
          broadcastLobbyEvent(lobbyCode, "LOBBY_EXPIRED", {
            reason: "Lobi otomatik olarak silindi",
          });
        }
      } catch (error) {
        console.error("Lobi silme hatası:", error);
      }
    };

    // 1. Durum: Tüm üyeler çıktıysa anında sil
    if (lobby.members.length === 0) {
      await checkAndCleanLobby();
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
      const deletionTimer = setTimeout(async () => {
        try {
          const currentLobby = await Lobby.findOne({ lobbyCode: lobbyCode });
          if (currentLobby) {
            // Tüm üyelere çıkış bildirimi yap
            currentLobby.members.forEach((member) => {
              broadcastLobbyEvent(lobbyCode, "USER_KICKED", {
                userId: member.id,
                reason: "Host geri dönmediği için lobi dağıtıldı",
              });
            });

            await checkAndCleanLobby();
          }
        } catch (error) {
          console.error("Host leave timer error:", error);
        }
      }, 60 * 1000); // 1 dakika

      lobbyTimers.set(timerKey, deletionTimer);

      // Yeni host bilgisini yayınla
      if (lobby.members.length > 0) {
        const newHost = lobby.members[0];
        lobby.createdBy = newHost.id;
        await lobby.save();
        broadcastLobbyEvent(lobbyCode, "NEW_HOST", {
          newHostId: newHost.id,
        });
      }
    }

    // Başarılı yanıt
    res.status(200).json({
      message: "Lobiden başarıyla çıkıldı",
      lobby: {
        ...lobby.toObject(),
        members: lobby.members.map((m) => ({ id: m.id, name: m.name })),
      },
    });
  } catch (error) {
    console.error("Lobiden ayrılma hatası:", error);
    res.status(500).json({ message: "Lobiden ayrılırken bir hata oluştu.", error: error.message });
  }
};


export const deleteLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  try {
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });

    if (!lobby) {
      return res.status(404).json({ message: "Lobi bulunamadı." });
    }

    // Lobiyi silme yetkisi kontrolü
    if (lobby.createdBy !== user.id) {
      return res.status(403).json({ message: "Bu lobiyi silme yetkiniz yok." });
    }

    // Eğer bu lobiye ait aktif bir oyun varsa, oyunun ilerleyişini ve timer’ları temizle
    if (bingoGames[lobbyCode]) {
      const game = bingoGames[lobbyCode];

      // Temizlenecek başlangıç ve bitiş zamanlayıcıları varsa
      if (lobbyTimers.get(`start_${lobby.id}`)) {
        clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
        lobbyTimers.delete(`start_${lobby.id}`);
      }
      if (lobbyTimers.get(`end_${lobby.id}`)) {
        clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
        lobbyTimers.delete(`end_${lobby.id}`);
      }

      // Eğer otomatik sayı çekim interval'ı varsa temizle
      if (game.autoDrawInterval) {
        clearInterval(game.autoDrawInterval);
      }

      // Aktif oyunu sonlandırın ve kullanıcılara oyun iptali bildirimi gönderin.
      broadcastLobbyEvent(lobby.lobbyCode, "GAME_TERMINATED", {
        lobbyCode: lobby.lobbyCode,
        message: "Oyun iptal edildi."
      }, lobby.members.map(member => member.id));

      // İlgili oyunu sistemden kaldırın.
      delete bingoGames[lobbyCode];
    } else {
      // Eğer aktif bir oyun yoksa da lobi silindiğini tüm kullanıcılara bildiriyoruz.
      broadcastLobbyEvent(lobby.lobbyCode, "LOBBY_DELETED", {
        lobbyCode: lobby.lobbyCode,
        message: "Lobi silindi."
      });
    }

    // Lobiyi veritabanından sil
    await Lobby.deleteOne({ lobbyCode: lobbyCode });

    // Başarılı yanıt
    res.status(200).json({
      message: "Lobi başarıyla silindi.",
      deletedLobby: lobby.toObject(),
    });
  } catch (error) {
    console.error("Lobi silme hatası:", error);
    res.status(500).json({ message: "Lobi silinirken bir hata oluştu.", error: error.message });
  }
};


// Lobi güncelleme fonksiyonu (eş zamanlı güncelleme için)
export const updateLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const { lobbyName, maxMembers, game, password, startTime, endTime, lobbyType } = req.body; // Güncellenebilir alanlar
  const user = req.user;

  try {
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });

    if (!lobby) {
      return res.status(404).json({ message: "Lobi bulunamadı." });
    }

    // Yetki kontrolü: Sadece host güncelleyebilir
    if (lobby.createdBy !== user.id) {
      return res.status(403).json({ message: "Bu lobiyi güncelleme yetkiniz yok." });
    }

    // Güncelleme alanlarını kontrol et ve güncelle
    if (lobbyName !== undefined) {
      if (!lobbyName.trim()) {
        return res.status(400).json({ message: "Lobi adı boş olamaz." });
      }
      lobby.lobbyName = lobbyName;
    }

    if (game !== undefined) { // Game güncellemesini ekleyin
      if (!game) {
        return res.status(400).json({ message: "Oyun türü boş olamaz." });
      }
      lobby.game = game;
    }

    if (maxMembers !== undefined) {
      if (typeof maxMembers !== 'number' || maxMembers <= 0) {
        return res.status(400).json({ message: "Maksimum üye sayısı pozitif bir sayı olmalıdır." });
      }
      lobby.maxMembers = maxMembers;
    }

    if (password !== undefined) {
      const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
      lobby.password = hashedPassword;
    }

    // LOBİ TÜRÜ GÜNCELLEMESİNİ EKLE
    if (lobbyType !== undefined) {
      if (!['normal', 'event'].includes(lobbyType)) { // Geçerli türleri kontrol et
        return res.status(400).json({ message: "Geçersiz lobi türü." });
      }
      lobby.lobbyType = lobbyType; // lobbyType'ı güncelle

      if (lobbyType === 'event') {
        // **VALIDATION and UPDATE for startTime and endTime when switching to 'event'**
        if (!startTime) {
          return res.status(400).json({ message: "Etkinlik lobisi için başlangıç zamanı zorunludur." });
        }
        if (!endTime) {
          return res.status(400).json({ message: "Etkinlik lobisi için bitiş zamanı zorunludur." });
        }

        const startTimeDate = new Date(startTime);
        const endTimeDate = new Date(endTime);
        const now = new Date();

        if (startTimeDate < now) {
          return res.status(400).json({ message: "Başlangıç zamanı gelecekte olmalıdır." });
        }
        if (endTimeDate <= startTimeDate) {
          return res.status(400).json({ message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır." });
        }

        lobby.startTime = startTimeDate;
        lobby.endTime = endTimeDate;
      } else if (lobbyType === 'normal') {
        // Optionally clear startTime and endTime if switching back to normal lobby
        lobby.startTime = null;
        lobby.endTime = null;
      }
    }

    // Event specific time updates and timer reset (moved outside lobbyType check for clarity and to handle individual time updates)
    if (lobby.lobbyType === "event") {
      let timeUpdated = false; // Flag to track if startTime or endTime was updated

      if (startTime !== undefined) {
        if (!startTime) {
          return res.status(400).json({ message: "Etkinlik lobisi için başlangıç zamanı zorunludur." }); // Redundant check, but good for safety
        }
        const startTimeDate = new Date(startTime);
        const now = new Date();
        if (startTimeDate < now) {
          return res.status(400).json({ message: "Başlangıç zamanı gelecekte olmalıdır." });
        }
        lobby.startTime = startTimeDate;
        timeUpdated = true;
      }

      if (endTime !== undefined) {
        if (!endTime) {
          return res.status(400).json({ message: "Etkinlik lobisi için bitiş zamanı zorunludur." }); // Redundant check, but good for safety
        }
        const endTimeDate = new Date(endTime);
        if (!lobby.startTime) { // Check if lobby.startTime is valid before comparison
          return res.status(400).json({ message: "Başlangıç zamanı tanımlı değil. Lütfen önce başlangıç zamanını ayarlayın." });
        }
        if (endTimeDate <= lobby.startTime) {
          return res.status(400).json({ message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır." });
        }
        lobby.endTime = endTimeDate;
        timeUpdated = true;
      }

      // Timer'ları yeniden ayarla (eğer zamanlar güncellendiyse)
      if (timeUpdated) { // Check the flag instead of redundant lobbyType check
        // Önce mevcut timer'ları temizle
        if (lobbyTimers.get(`start_${lobby.id}`)) {
          clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
          lobbyTimers.delete(`start_${lobby.id}`);
        }
        if (lobbyTimers.get(`end_${lobby.id}`)) {
          clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
          lobbyTimers.delete(`end_${lobby.id}`);
        }

        if (lobby.startTime && lobby.endTime) { // Ensure both times are valid before setting timers
          const startTimeMs = lobby.startTime.getTime();
          const endTimeMs = lobby.endTime.getTime();
          const now = Date.now();

          // Event başlangıç zamanı için timer (sadece startTime gelecekte ise)
          if (startTimeMs > now) {
            const startTimer = setTimeout(async () => {
              try {
                const currentLobby = await Lobby.findOne({ id: lobby.id }).lean();
                if (currentLobby) {
                  const memberIds = currentLobby.members.map(member => member.id);

                  broadcastLobbyEvent(lobbyCode, "EVENT_START_NOTIFICATION", {
                    lobbyId: lobby.id,
                    lobbyName: lobby.lobbyName,
                    lobbyCode: lobbyCode,
                    message: `Event "${lobby.lobbyName}" has started!`,
                    game: lobby.game,
                    startTime: lobby.startTime,
                    endTime: lobby.endTime
                  }, memberIds);
                }
              } catch (error) {
                console.error("Event start timer error:", error);
              }
            }, startTimeMs - now);
            lobbyTimers.set(`start_${lobby.id}`, startTimer);
          }

          // Event bitiş zamanı için timer
          const endTimer = setTimeout(async () => {
            try {
              const currentLobby = await Lobby.findOne({ id: lobby.id }).lean();
              if (currentLobby) {
                broadcastLobbyEvent(
                  lobbyCode,
                  "LOBBY_REMOVED",
                  {
                    lobbyCode: lobbyCode,
                    reason: "Event ended",
                    lobbyId: currentLobby.id
                  },
                  null
                );
                await Lobby.deleteOne({ id: currentLobby.id });
              }
            } catch (error) {
              console.error("Event end timer error:", error);
            }
          }, endTimeMs - now);
          lobbyTimers.set(`end_${lobby.id}`, endTimer);
        }
      }
    }


    await lobby.save();

    // WebSocket üzerinden lobi güncelleme olayını yayınla
    broadcastLobbyEvent(lobbyCode, "LOBBY_UPDATED", lobby.toObject());

    res.status(200).json({
      message: "Lobi başarıyla güncellendi.",
      lobby: lobby.toObject(),
    });

  } catch (error) {
    console.error("Lobi güncelleme hatası:", error);
    res.status(500).json({ message: "Lobi güncellenirken bir hata oluştu.", error: error.message });
  }
};


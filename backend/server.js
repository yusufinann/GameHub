import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import memorystore from 'memorystore';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createServer } from 'http';
import setupWebSocket from './websocket/webSocketServer.js';
const MemoryStore = memorystore(session);
const app = express();
const server = createServer(app); // HTTP sunucusu oluştur

// WebSocket sunucusunu başlat
const { broadcastLobbyEvent } = setupWebSocket(server);

const SECRET_KEY = 'your_secret_key'; // Güçlü bir anahtar seçin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const corsOptions = {
  origin: FRONTEND_URL, // Frontend URL'si
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // İzin verilen metodlar
  credentials: true, // Kimlik bilgilerini (cookies, authorization headers) gönder
};

// Middleware'ler
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }), // Günlük temizleme
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }, // 1 saat
  })
);

// Kullanıcı verileri
const users = [
  { id: 1, email: 'user1@example.com', password: bcrypt.hashSync('password1', 10), name: 'John Doe', avatar: 'https://example.com/avatar1.jpg' },
  { id: 2, email: 'user2@example.com', password: bcrypt.hashSync('password2', 10), name: 'Jane Smith', avatar: 'https://example.com/avatar2.jpg' },
  { id: 3, email: 'user3@example.com', password: bcrypt.hashSync('password3', 10), name: 'Alice Johnson', avatar: 'https://example.com/avatar3.jpg' },
  { id: 4, email: 'user4@example.com', password: bcrypt.hashSync('password4', 10), name: 'Bob Brown', avatar: 'https://example.com/avatar4.jpg' },
  { id: 5, email: 'user5@example.com', password: bcrypt.hashSync('password5', 10), name: 'Charlie Davis', avatar: 'https://example.com/avatar5.jpg' },
];

// Lobi verilerini saklamak için geçici bir dizi
let lobbies = [];
const lobbyTimers = new Map();

// Lobi ID'si ve kodu oluşturma fonksiyonları
const generateLobbyId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateLobbyCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Kullanıcı doğrulama middleware'i
const authenticateUser = (req, res, next) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme hatası. Lütfen giriş yapın.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    req.user = user; // Kullanıcı bilgisini request'e ekle
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }
};

// Giriş endpoint'i
app.post('/login', (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = users.find((u) => u.email === email);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });

    if (rememberMe) {
      res.cookie('authToken', token, { maxAge: 86400000, httpOnly: true }); // 1 gün
    }

    return res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// Çıkış endpoint'i
app.post('/logout', authenticateUser, (req, res) => {
  res.clearCookie('authToken');
  return res.status(200).json({ message: 'Logout successful' });
});

// Kullanıcı bilgilerini getirme endpoint'i
app.get('/user', authenticateUser, (req, res) => {
  const user = req.user;
  return res.json({ email: user.email, name: user.name, avatar: user.avatar });
});

// Lobi oluşturma endpoint'i
app.post('/api/lobbies/create', authenticateUser, (req, res) => {
  const { lobbyName, lobbyType, startTime, endTime, password, game, maxMembers } = req.body;
  const user = req.user;

   // Kullanıcının zaten bir lobisi olup olmadığını kontrol et
  const existingLobby = lobbies.find(lobby => lobby.createdBy === user.id);
  if (existingLobby) {
    return res.status(400).json({ message: 'You already have one lobby. You cannot create more than one lobby.' });
  }

  // Gerekli alanların kontrolü
  if (!lobbyName.trim() || !lobbyType || !game || !maxMembers || maxMembers <= 0) {
    return res.status(400).json({ message: 'Lobby name, type, game and max members are mandatory. Max members must be at least 1.' });
  }

  // Etkinlik lobisi için başlangıç ve bitiş zamanı kontrolü
  if (lobbyType === 'event' && (!startTime || !endTime)) {
    return res.status(400).json({ message: 'The start and end time for the event lobby is mandatory.' });
  }

  if (lobbyType === 'event' && new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ message: 'The start time must be before the end time.' });
  }

  // Şifreyi hash'le
  const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

  // Yeni lobi oluştur
  const newLobby = {
    id: generateLobbyId(),
    createdBy: user.id,
    lobbyName,
    lobbyType,
    startTime: lobbyType === 'event' ? startTime : null,
    endTime: lobbyType === 'event' ? endTime : null,
    password: hashedPassword, // Hash'lenmiş şifreyi kaydet
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
    isActive: true, // Lobi aktif mi?
    expiryTime: lobbyType === 'event' ? null : new Date(Date.now() + 8 * 60 * 60 * 1000), // Normal lobi için 8 saat sonra
  };
  // Lobiye ekle
  if (lobbyType === 'event') {
    const startTimeMs = new Date(startTime).getTime();
    const endTimeMs = new Date(endTime).getTime();
    const now = Date.now();
  
    // Event başlangıç zamanı için timer
    if (startTimeMs > now) {
      const startTimer = setTimeout(() => {
        broadcastLobbyEvent(newLobby.lobbyCode, 'EVENT_STATUS', { 
          status: 'started',
          lobbyCode: newLobby.lobbyCode 
        });
      }, startTimeMs - now);
      lobbyTimers.set(`start_${newLobby.id}`, startTimer);
    }
  
    // Event bitiş zamanı için timer
    const endTimer = setTimeout(() => {
      broadcastLobbyEvent(newLobby.lobbyCode, 'EVENT_STATUS', { 
        status: 'ended',
        lobbyCode: newLobby.lobbyCode 
      });
      
      // Lobi silme işlemi
      setTimeout(() => {
        const index = lobbies.findIndex(l => l.id === newLobby.id);
        if (index !== -1) {
          lobbies.splice(index, 1);
          broadcastLobbyEvent(newLobby.lobbyCode, 'LOBBY_EXPIRED', {
            lobbyCode: newLobby.lobbyCode,
            reason: 'Event time expired',
          });
        }
      }, 5000); // 5 saniye gecikmeli silme
    }, endTimeMs - now);
  
    lobbyTimers.set(`end_${newLobby.id}`, endTimer);
  }
  
  lobbies.push(newLobby);

  // WebSocket üzerinden lobi oluşturma olayını yayınla
  broadcastLobbyEvent(newLobby.lobbyCode, 'LOBBY_CREATED', newLobby);

  // Başarılı yanıt
  res.status(201).json({
    message: 'Lobi başarıyla oluşturuldu.',
    lobby: newLobby,
    lobbyLink: `${FRONTEND_URL}/lobby/${newLobby.lobbyCode}`,
    members: newLobby.members,
  });
});

// Lobiye katılma endpoint'i
app.post('/api/lobbies/join/:lobbyCode', authenticateUser, (req, res) => {
  const { lobbyCode } = req.params;
  const { password } = req.body;
  const user = req.user;

  // Lobi bul
  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: 'Lobi bulunamadı.' });
  }

  // Şifre kontrolü (hash'lenmiş şifre için)
  if (lobby.password && !bcrypt.compareSync(password, lobby.password)) {
    return res.status(401).json({ message: 'Geçersiz şifre.' });
  }

  // Lobi dolu mu?
  if (lobby.maxMembers && lobby.members.length >= lobby.maxMembers) {
    return res.status(400).json({ message: 'Lobi dolu.' });
  }

  // Kullanıcı zaten lobide mi?
  const isUserAlreadyInLobby = lobby.members.some((member) => member.id === user.id);
  if (isUserAlreadyInLobby) {
    return res.status(400).json({ message: 'Zaten bu lobidesiniz.' });
  }

  // Kullanıcıyı lobiye ekle
  lobby.members.push({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    isHost: false,
  });

  // WebSocket üzerinden yeni üye olayını yayınla
  broadcastLobbyEvent(lobbyCode, 'USER_JOINED', {
    userId: user.id,
    userName: user.name,
    avatar: user.avatar,
  });

  // Başarılı yanıt
  res.status(200).json({
    message: 'Lobiye başarıyla katıldınız.',
    lobby,
  });
});

// Lobi bilgilerini getirme endpoint'i
app.get('/api/lobbies/:lobbyCode', authenticateUser, (req, res) => {
  const { lobbyCode } = req.params;
  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: 'Lobi bulunamadı.' });
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
    message: 'Lobi bilgileri başarıyla getirildi.',
    lobby: {
      ...lobby,
      members: membersWithDetails,
      password: undefined, // Şifreyi göndermeyin
    },
  });
});

// Tüm lobileri veya filtreli lobileri getirme endpoint'i
app.get('/api/lobbies', authenticateUser, (req, res) => {
  const { eventType, hasPassword } = req.query;
  let filteredLobbies = lobbies;

  // Etkinlik lobisi filtresi
  if (eventType) {
    filteredLobbies = filteredLobbies.filter((lobby) => lobby.lobbyType === eventType);
  }

  // Şifreli lobi filtresi
  if (hasPassword === 'true') {
    filteredLobbies = filteredLobbies.filter((lobby) => lobby.password !== null);
  } else if (hasPassword === 'false') {
    filteredLobbies = filteredLobbies.filter((lobby) => lobby.password === null);
  }

  // Aktif lobileri filtrele
  filteredLobbies = filteredLobbies.filter((lobby) => {
    if (lobby.lobbyType === 'event') {
      // Etkinlik lobileri bitiş zamanına kadar aktif
      return new Date(lobby.endTime) > new Date();
    } else {
      // Normal lobiler expiryTime'a kadar aktif
      return lobby.isActive && new Date(lobby.expiryTime) > new Date();
    }
  });

  // Başarılı yanıt
  res.status(200).json({
    message: 'Lobiler başarıyla getirildi.',
    lobbies: filteredLobbies,
  });
});

// Lobi çıkma endpoint'i
app.post('/api/lobbies/leave/:lobbyCode', authenticateUser, (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  // Lobi bul
  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: 'Lobi bulunamadı.' });
  }

  // Kullanıcı lobide mi?
  const userIndex = lobby.members.findIndex((member) => member.id === user.id);
  if (userIndex === -1) {
    return res.status(400).json({ message: 'Bu lobide değilsiniz.' });
  }

  // Kullanıcıyı lobiden çıkar
  lobby.members.splice(userIndex, 1);

  // WebSocket üzerinden üye çıkış olayını yayınla
  broadcastLobbyEvent(lobbyCode, 'USER_LEFT', {
    userId: user.id,
    userName: user.name,
  });

// Eğer çıkan kullanıcı host ise ve normal lobi ise süre sonu ayarla
  if (user.id === lobby.createdBy && lobby.lobbyType !== 'event') {
    const existingTimerKey = `expiry_${lobby.id}`;
    const existingTimer = lobbyTimers.get(existingTimerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      lobbyTimers.delete(existingTimerKey);
    }

    // 8 saat sonra sil
    const deletionTimer = setTimeout(() => {
      const index = lobbies.findIndex((l) => l.lobbyCode === lobbyCode);
      if (index !== -1) {
        lobbies.splice(index, 1);
        broadcastLobbyEvent(lobbyCode, 'LOBBY_EXPIRED', {
          reason: 'Host ayrıldıktan sonra lobi süresi doldu.',
        });
      }
    }, 8 * 60 * 60 * 1000); // 8 saat

    lobby.expiryTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    lobby.isActive = false;
    lobbyTimers.set(existingTimerKey, deletionTimer);
  }
  // Başarılı yanıt
  res.status(200).json({
    message: 'Lobiden başarıyla çıkıldı.',
    lobby,
  });
});

// Lobi silme endpoint'i
app.delete('/api/lobbies/delete/:lobbyCode', authenticateUser, (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  // Lobi bul
  const lobbyIndex = lobbies.findIndex((lobby) => lobby.lobbyCode === lobbyCode);

  if (lobbyIndex === -1) {
    return res.status(404).json({ message: 'Lobi bulunamadı.' });
  }

  const lobby = lobbies[lobbyIndex];

  // Lobiyi silme yetkisi kontrolü
  if (lobby.createdBy !== user.id) {
    return res.status(403).json({ message: 'Bu lobiyi silme yetkiniz yok.' });
  }

  // Lobiyi diziden sil
  lobbies.splice(lobbyIndex, 1);

  // WebSocket üzerinden lobi silme olayını yayınla
  broadcastLobbyEvent(lobbyCode, 'LOBBY_DELETED', null);

  // Başarılı yanıt
  res.status(200).json({
    message: 'Lobi başarıyla silindi.',
    deletedLobby: lobby,
  });
});

// Süresi dolan lobileri temizleme
setInterval(() => {
  const now = new Date();
  lobbies = lobbies.filter((lobby) => {
    if (lobby.lobbyType === 'event') {
      return new Date(lobby.endTime) > now;
    } else {
      return lobby.isActive && new Date(lobby.expiryTime) > now;
    }
  });
}, 60 * 60 * 1000); // Her saat başı kontrol et

// Sunucuyu başlat
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
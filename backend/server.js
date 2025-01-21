import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import memorystore from 'memorystore';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const MemoryStore = memorystore(session);
const app = express();
const SECRET_KEY = 'your_secret_key'; // Güçlü bir anahtar seçin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const corsOptions = {
  origin: FRONTEND_URL, // Frontend URL'si
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // İzin verilen metodlar
  credentials: true, // Kimlik bilgilerini (cookies, authorization headers) gönder
};

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
  { id: 1, email: 'user1@example.com', password: bcrypt.hashSync('password1', 10), name: 'John Doe' },
  { id: 2, email: 'user2@example.com', password: bcrypt.hashSync('password2', 10), name: 'Jane Smith' },
  { id: 3, email: 'user3@example.com', password: bcrypt.hashSync('password3', 10), name: 'Alice Johnson' },
  { id: 4, email: 'user4@example.com', password: bcrypt.hashSync('password4', 10), name: 'Bob Brown' },
  { id: 5, email: 'user5@example.com', password: bcrypt.hashSync('password5', 10), name: 'Charlie Davis' },
];

// Lobi verilerini saklamak için geçici bir dizi
let lobbies = [];

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
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

    if (rememberMe) {
      res.cookie('authToken', token, { maxAge: 86400000, httpOnly: true }); // 1 gün
    }

    // Kullanıcının id'sini de yanıta ekleyin
    return res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/logout', authenticateUser, (req, res) => {
  try {
    // Kullanıcının token'ını geçersiz kılma işlemi (örneğin, bir blacklist'e ekleme)
    // Bu örnekte token'ı sadece kaldırıyoruz.
    res.clearCookie('authToken'); // Eğer cookie kullanıyorsanız, temizleyin
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
});
// Kullanıcı bilgilerini getirme endpoint'i
app.get('/user', authenticateUser, (req, res) => {
  const user = req.user;
  return res.json({ email: user.email, name: user.name });
});

// Lobi oluşturma endpoint'i
app.post('/api/lobbies/create', authenticateUser, (req, res) => {
  const { lobbyName, lobbyType, startTime, endTime, password, game, maxMembers} = req.body;
  const user = req.user;

  // Gerekli alanların kontrolü
  if (!lobbyName || !lobbyType || !game || !maxMembers) {
    return res.status(400).json({ message: 'Lobi adı, türü, oyun ve maksimum oyuncu sayısı zorunludur.' });
  }

  // Etkinlik lobisi için başlangıç ve bitiş zamanı kontrolü
  if (lobbyType === 'event' && (!startTime || !endTime)) {
    return res.status(400).json({ message: 'Etkinlik lobisi için başlangıç ve bitiş zamanı zorunludur.' });
  }

  if (lobbyType === 'event' && new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ message: 'Başlangıç zamanı bitiş zamanından önce olmalıdır.' });
  }

  // Yeni lobi oluştur
  const newLobby = {
    id: generateLobbyId(),
    createdBy: user.id, // Lobi oluşturan kullanıcının ID'si
    lobbyName,
    lobbyType,
    startTime: lobbyType === 'event' ? startTime : null,
    endTime: lobbyType === 'event' ? endTime : null,
    password: password || null,
    game,
    maxMembers,
    createdAt: new Date(),
    members: [user.id], // Lobi oluşturan kullanıcıyı oyuncu listesine ekle
    lobbyCode: generateLobbyCode(),
  };

  // Lobiye ekle
  lobbies.push(newLobby);

  // Başarılı yanıt
  res.status(201).json({
    message: 'Lobi başarıyla oluşturuldu.',
    lobby: newLobby,
    lobbyLink: `${FRONTEND_URL}/lobby/${newLobby.lobbyCode}`, // Lobiye bağlanma linki
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

  // Şifre kontrolü
  if (lobby.password && lobby.password !== password) {
    return res.status(401).json({ message: 'Geçersiz şifre.' });
  }

  // members dizisini başlat (eğer yoksa)
  if (!lobby.members) {
    lobby.members = [];
  }

  // Lobi dolu mu?
  if (lobby.maxMembers && lobby.members.length >= lobby.maxMembers) {
    return res.status(400).json({ message: 'Lobi dolu.' });
  }

  // Kullanıcı zaten lobide mi?
  if (lobby.members.includes(user.id)) {
    return res.status(400).json({ message: 'Zaten bu lobidesiniz.' });
  }

  // Kullanıcıyı lobiye ekle
  lobby.members.push(user.id);

  // Lobi bilgisini güncelle (örneğin, veritabanına kaydet)
  // await updateLobbyInDatabase(lobby); // Eğer veritabanı kullanıyorsanız

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

  // Üyelerin bilgilerini dahil et
  const membersWithDetails = lobby.members.map((memberId) => {
    const user = users.find((u) => u.id === memberId);
    return {
      id: memberId,
      name: user ? user.name : `Player ${memberId}`,
      isHost: memberId === lobby.createdBy,
    };
  });

  // Lobi bilgilerini ve üyelerin detaylarını gönder
  res.status(200).json({
    message: 'Lobi bilgileri başarıyla getirildi.',
    lobby: {
      ...lobby,
      members: membersWithDetails,
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

  // Başarılı yanıt
  res.status(200).json({
    message: 'Lobiler başarıyla getirildi.',
    lobbies: filteredLobbies,
  });
});

// Lobi çıkma endpoint'i
app.post('/api/lobbies/leave/:lobbyCode', authenticateUser, (req, res) => {
  const { lobbyCode } = req.params; // Lobi kodu
  const user = req.user; // Kimlik doğrulaması yapılmış kullanıcı

  // Lobi bul
  const lobby = lobbies.find((lobby) => lobby.lobbyCode === lobbyCode);

  if (!lobby) {
    return res.status(404).json({ message: 'Lobi bulunamadı.' });
  }

  // Kullanıcı lobide mi?
  const userIndex = lobby.members.indexOf(user.id);
  if (userIndex === -1) {
    return res.status(400).json({ message: 'Bu lobide değilsiniz.' });
  }

  // Kullanıcıyı lobiden çıkar
  lobby.members.splice(userIndex, 1);

  // Eğer lobi boşsa, lobiyi sil
  if (lobby.members.length === 0) {
    const lobbyIndex = lobbies.findIndex((l) => l.lobbyCode === lobbyCode);
    lobbies.splice(lobbyIndex, 1);
    return res.status(200).json({ message: 'Lobiden çıkıldı ve lobi silindi.' });
  }

  // Başarılı yanıt
  res.status(200).json({ message: 'Lobiden başarıyla çıkıldı.', lobby });
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

  // Lobiyi silme yetkisi kontrolü
  if (lobbies[lobbyIndex].createdBy !== user.id) {
    return res.status(403).json({ message: 'Bu lobiyi silme yetkiniz yok.' });
  }

  // Lobiyi diziden sil
  lobbies.splice(lobbyIndex, 1);

  // Başarılı yanıt
  res.status(200).json({ message: 'Lobi başarıyla silindi.' });
});
// Sunucuyu başlat
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
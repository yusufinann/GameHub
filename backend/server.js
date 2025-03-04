//server.js
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import memorystore from "memorystore";
import cors from "cors";
import { createServer } from "http";
import setupWebSocket from "./websocket/webSocketServer.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import connectToMongoDB from './db/connectToMongoDB.js';
import authenticateUser from "./middleware/authenticateUser.js";
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import lobbyRoutes from './routes/lobby.routes.js'
import bingoRoutes from './routes/bingo.routes.js'
import { initializeWebSocket as initializeLobbyWebSocket } from "./controllers/lobby.controller.js";
import { initializeFriendWebSocket } from "./controllers/friend.controller.js";
const MemoryStore = memorystore(session);
const app = express();
const server = createServer(app); // HTTP sunucusu oluştur

// WebSocket sunucusunu başlat
// WebSocket sunucusunu başlat
const { broadcastLobbyEvent, broadcastFriendEvent } = setupWebSocket(server);

// Lobi ve arkadaş modülleri için farklı broadcast fonksiyonlarını kullanıyoruz
initializeLobbyWebSocket(broadcastLobbyEvent);
initializeFriendWebSocket(broadcastFriendEvent);
const SECRET_KEY = "your_secret_key"; // Güçlü bir anahtar seçin
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const corsOptions = {
  origin: FRONTEND_URL, // Frontend URL'si
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"], // İzin verilen metodlar
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
    cookie: { secure: false, maxAge: 86400000 }, // 24 saat
  })
);
//app.use("/api/friends", friendRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/lobbies",lobbyRoutes)
app.use("/api/bingo",bingoRoutes)

//Games endpoint with authentication
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get('/api/games', authenticateUser, (req, res) => {
  console.log('Current directory:', __dirname);

  try {
    const filePath = path.join(__dirname, 'datas', 'dummyGames.json');
    console.log('Attempting to read file from:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({
        message: "Games data file not found",
        path: filePath
      });
    }

    console.log('Reading file...');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('File read successfully, parsing JSON...');

    const gamesData = JSON.parse(fileContent);
    console.log('JSON parsed successfully');

    if (!gamesData.data || !Array.isArray(gamesData.data)) {
      console.log('Invalid data structure:', typeof gamesData, gamesData.data ? 'has data property' : 'no data property');
      return res.status(500).json({ message: "Invalid data structure in games file" });
    }

    console.log('Sending response with', gamesData.data.length, 'games');
    return res.status(200).json(gamesData);

  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });

    if (error.code === 'ENOENT') {
      return res.status(404).json({ message: "Games data file not found", details: error.message });
    }

    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: "Error parsing games data", details: error.message });
    }

    return res.status(500).json({ message: "Failed to load games", details: error.message });
  }
});

// // Ortak lobi silme fonksiyonu
// function deleteLobby(lobbyCode, reason) {
//   const lobbyIndex = lobbies.findIndex((l) => l.lobbyCode === lobbyCode);
//   if (lobbyIndex === -1) return;

//   // Tüm zamanlayıcıları temizle
//   const lobby = lobbies[lobbyIndex];
//   const timerKey = `host_leave_${lobby.id}`;
//   const existingTimer = lobbyTimers.get(timerKey);
//   if (existingTimer) {
//     clearTimeout(existingTimer);
//     lobbyTimers.delete(timerKey);
//   }

//   // Lobi silme işlemi
//   lobbies.splice(lobbyIndex, 1);

//   // Tek tip silme bildirimi
//   broadcastLobbyEvent(lobbyCode, "LOBBY_DELETED", {
//     reason,
//     lobbyCode,
//     deletedAt: new Date().toISOString(),
//   });
// }



// Sunucuyu başlat

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import dotenv from 'dotenv';
import {RedisStore} from "connect-redis"; 

import setupWebSocket from "./websocket/webSocketServer.js";
import connectToMongoDB from './db/connectToMongoDB.js';
import redisClient from './redisClient.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import lobbyRoutes from './routes/lobby.routes.js';
import bingoRoutes from './routes/bingo.routes.js';
import hangmanRoutes from './routes/hangman.routes.js';
import friendGroupRoutes from './routes/friendGroup.routes.js';
import friendRoutes from './routes/friend.routes.js';
import chatRoutes from './routes/chat.routes.js';
import gamesRouter from './routes/dummyGames.routes.js';

import { initializeWebSocket as initializeLobbyWebSocket } from "./controllers/lobby.controller.js";
import { initializeFriendWebSocket } from "./controllers/friend.controller.js";

dotenv.config();

const app = express();
const server = createServer(app);

const { broadcastLobbyEvent, broadcastFriendEvent } = setupWebSocket(server);

initializeLobbyWebSocket(broadcastLobbyEvent);
initializeFriendWebSocket(broadcastFriendEvent);

if (friendGroupRoutes && typeof friendGroupRoutes === 'object') {
    friendGroupRoutes.broadcastFriendEvent = broadcastFriendEvent;
}

const SECRET_KEY = process.env.SESSION_SECRET || "your_very_secure_secret_key_here_fallback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const NODE_ENV = process.env.NODE_ENV || "development";

const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

const redisSessionStore = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

app.use(
  session({
    store: redisSessionStore,
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // sameSite: NODE_ENV === "production" ? "none" : "lax", 
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lobbies", lobbyRoutes);
app.use("/api/bingo", bingoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friendlist', friendRoutes);
app.use('/api/games', gamesRouter);
app.use("/api/hangman", hangmanRoutes);
app.use("/api/friend-groups", friendGroupRoutes);

async function initializeApp() {
  try {
    await connectToMongoDB();

    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis istemcisi initializeApp içinde başarıyla bağlandı.");
    } else {
        console.log("Redis istemcisi zaten bağlı.");
    }
    console.log("MongoDB ve Redis bağlantıları (veya bağlantı durumu) kontrol edildi.");


    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor.`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      console.log(`Node Environment: ${NODE_ENV}`);
    });

  } catch (err) {
    console.error("Uygulama başlatılırken kritik hata:", err);
    if (err.message.toLowerCase().includes('redis') || err.message.toLowerCase().includes('mongo')) {
        console.error("Veritabanı bağlantı hatası nedeniyle uygulama sonlandırılıyor.");
        process.exit(1);
    }
  }
}

initializeApp();
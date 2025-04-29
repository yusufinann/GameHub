import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import memorystore from "memorystore";
import cors from "cors";
import { createServer } from "http";
import setupWebSocket from "./websocket/webSocketServer.js";
import connectToMongoDB from './db/connectToMongoDB.js';
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import lobbyRoutes from './routes/lobby.routes.js'
import bingoRoutes from './routes/bingo.routes.js'
import friendGroupRoutes from './routes/friendGroup.routes.js'
import friendRoutes from './routes/friend.routes.js'
import chatRoutes from './routes/chat.routes.js'
import gamesRouter from './routes/dummyGames.routes.js'
import { initializeWebSocket as initializeLobbyWebSocket } from "./controllers/lobby.controller.js";
import { initializeFriendWebSocket } from "./controllers/friend.controller.js";
const MemoryStore = memorystore(session);
const app = express();
const server = createServer(app);

const { broadcastLobbyEvent, broadcastFriendEvent} = setupWebSocket(server);

initializeLobbyWebSocket(broadcastLobbyEvent);
initializeFriendWebSocket(broadcastFriendEvent);

friendGroupRoutes.broadcastFriendEvent = broadcastFriendEvent;
const SECRET_KEY = "your_secret_key"; 
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const corsOptions = {
  origin: FRONTEND_URL, 
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"], 
  credentials: true, 
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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lobbies",lobbyRoutes)
app.use("/api/bingo",bingoRoutes)
app.use('/api/chat', chatRoutes);
app.use('/api/friendlist', friendRoutes); 
app.use('/api/games', gamesRouter);


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

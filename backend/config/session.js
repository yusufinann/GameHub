import MemoryStore from "memorystore";
import session from "express-session";

const MemoryStoreSession = MemoryStore(session);  // Memorystore'u express-session ile bağlayın

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "default-secret-key",
  resave: false,
  saveUninitialized: true,
  store: new MemoryStoreSession({
    checkPeriod: 86400000, // 24 saatlik kontrol periyodu
  }),
  cookie: {
    maxAge: 86400000,  // 24 saatlik oturum süresi
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // sadece https üzerinden gönderilsin
  },
};

export default sessionConfig;

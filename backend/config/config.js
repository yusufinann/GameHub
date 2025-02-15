// config/config.js
import dotenv from 'dotenv';

dotenv.config();

const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "your_secret_key",
    expiresIn: "24h"
  },
  cookie: {
    maxAge: 86400000, // 24 hours in milliseconds
    httpOnly: true
  }
};

export default config;
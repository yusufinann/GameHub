import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisPassword = process.env.REDIS_PASSWORD;

let redisURL;

if (redisPassword && redisPassword.trim() !== '') {
  redisURL = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
} else {
  redisURL = `redis://${redisHost}:${redisPort}`;
}

const redisClient = createClient({
  url: redisURL,
});

redisClient.on('connect', () => {
  console.log('Resmi Redis istemcisi başarıyla bağlanıldı.');
});

redisClient.on('error', (err) => {
  console.error('Redis bağlantı hatası:', err);
});

export default redisClient;
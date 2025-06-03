import { createClient } from 'redis';
import dotenv from 'dotenv'; 

dotenv.config(); 

const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';

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
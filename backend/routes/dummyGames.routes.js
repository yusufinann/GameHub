import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../datas/dummyGames.json');
let allGames = [];
try {
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(fileContent);
  allGames = Array.isArray(parsed.data) ? parsed.data : parsed;
} catch (err) {
  console.error('Error loading dummyGames', err);
}

const router = express.Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || allGames.length;
  const offset = parseInt(req.query.offset, 10) || 0;
  const slice = allGames.slice(offset, offset + limit);
  res.json(slice);
});

export default router;

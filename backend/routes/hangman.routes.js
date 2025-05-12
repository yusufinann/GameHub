import express from 'express';

import authenticateUser from '../middleware/authenticateUser.js';
import { getPlayerStats, getUsersHangmanStats } from '../controllers/hangman.controller.js';

const router = express.Router();

router.get('/stats', authenticateUser, getUsersHangmanStats);
router.get('/stats/:userId', authenticateUser, getPlayerStats);

export default router;
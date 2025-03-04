import express from 'express';

import authenticateUser from '../middleware/authenticateUser.js';
import {getAllPlayerBingoStats,getPlayerStats, getUserBingoStats } from '../controllers/bingo.game.controller.js';

const router = express.Router();

router.get('/stats', authenticateUser, getUserBingoStats);
router.get('/stats/:userId', authenticateUser, getPlayerStats);
router.get('/players-stats',authenticateUser, getAllPlayerBingoStats);

export default router;
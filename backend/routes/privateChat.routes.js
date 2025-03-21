import express from 'express'
import authenticateUser from "../middleware/authenticateUser.js";
import { getPrivateChatHistory } from '../controllers/privateChat.controller.js';

const router = express.Router();
router.get('/private-chat-history', authenticateUser, getPrivateChatHistory); 

export default router;
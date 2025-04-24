// routes/chat.routes.js (/api/chat/ ...)
import express from 'express';
import friendGroupRoutes from './friendGroup.routes.js';
import communityChatRoutes from './community.routes.js';
import groupChatRoutes from './groupChat.routes.js';
import privateChatRoutes from './privateChat.routes.js';

const router = express.Router();

// Mount sub-routers with consistent internal paths if needed
router.use(friendGroupRoutes); 
router.use(communityChatRoutes); 
router.use(groupChatRoutes);     
router.use(privateChatRoutes);  

export default router;
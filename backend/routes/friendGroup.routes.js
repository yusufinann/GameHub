import express from 'express';
import {createFriendGroup,getUserFriendGroups,getFriendGroupChatHistory, getFriendGroupById} from '../controllers/friendGroupChat.controller.js';
import authenticateUser from '../middleware/authenticateUser.js';
const router = express.Router();

router.post('/friendgroup', authenticateUser, (req, res) => { 
    createFriendGroup(req, res,router.broadcastFriendEvent); 
});

router.get('/friendgroup/:groupId', authenticateUser, getFriendGroupById);

router.get('/friendgroups/me', authenticateUser, getUserFriendGroups);

router.get('/friendgroup/:groupId/history', authenticateUser, getFriendGroupChatHistory);


export default router;
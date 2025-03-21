// routes/groupChatRoutes.js
import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import { getAllGroups, getUserGroups, getGroupChatHistory } from "../controllers/groupChat.controller.js";

const router = express.Router();

router.get('/', authenticateUser, getAllGroups);
router.get('/user-groups', authenticateUser, getUserGroups);
router.get('/groups/:groupId/history', authenticateUser, getGroupChatHistory);

export default router;
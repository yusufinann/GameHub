import express from 'express'
import { getFriendList} from "../controllers/friend.controller.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();
router.get('/',authenticateUser, getFriendList); // GET /api/friendlist

export default router;
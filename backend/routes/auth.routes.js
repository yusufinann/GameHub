import express from 'express'
import { userLogin, userLogout } from '../controllers/auth.controller.js';
import authenticateUser from "../middleware/authenticateUser.js";
const router = express.Router();

router.post("/login",userLogin);

router.post("/logout",authenticateUser,userLogout);

export default router;
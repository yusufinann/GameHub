import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import { getCommunityMessages } from "../controllers/communityChat.controller.js";

const router = express.Router();

router.get("/community",authenticateUser, getCommunityMessages);


export default router;

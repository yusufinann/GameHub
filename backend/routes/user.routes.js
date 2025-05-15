// routes/user.routes.js
import express from "express";
import { getCurrentUser, searchUsers, getUserById, createUser, getAllUsers, getCombinedPlayerStats } from "../controllers/user.controller.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.get("/", getAllUsers); 
router.post("/", createUser); 
router.get("/profile", authenticateUser, getCurrentUser);
router.get("/search", authenticateUser, searchUsers);
router.get("/:id", authenticateUser, getUserById);
router.get('/stats/overall/:userId', getCombinedPlayerStats);

export default router;

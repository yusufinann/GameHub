// routes/user.routes.js
import express from 'express';
import { getCurrentUser, searchUsers, getUserById } from '../controllers/user.controller.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

// Get current user's profile
router.get("/profile", authenticateUser, getCurrentUser);

// Search users
router.get("/search", authenticateUser, searchUsers);

// Get user by ID
router.get("/:id", authenticateUser, getUserById);

export default router;
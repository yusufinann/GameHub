// routes/user.routes.js
import express from "express";
import { getCurrentUser, searchUsers, getUserById, createUser, getAllUsers } from "../controllers/user.controller.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.get("/", getAllUsers); // Yeni kullanıcı ekleme
router.post("/", createUser); // Yeni kullanıcı ekleme
router.get("/profile", authenticateUser, getCurrentUser);
router.get("/search", authenticateUser, searchUsers);
router.get("/:id", authenticateUser, getUserById);

export default router;

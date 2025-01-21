import express from "express";
import { loginUser } from "../controllers/auth.controller.js";
import { sessionAuth } from "../middleware/sessionAuth.js";

const router = express.Router();

// Login işlemi
router.post("/login", loginUser);

router.get("/profile", sessionAuth, (req, res) => {
  res.status(200).json({ message: "Welcome", user: req.session.user });
});



router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res
      .status(200)
      .json({ message: "Logged out successfully" });
  });
});

export default router;

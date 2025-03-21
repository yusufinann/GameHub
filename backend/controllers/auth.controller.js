import bcrypt from 'bcrypt';
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

let broadcastFriendEvent = null;

export const initializeFriendWebSocket = (wsHandler) => {
  broadcastFriendEvent = wsHandler;
};

export const userLogin = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {

            user.isOnline = true;
            await user.save();
            const userWithFriends = await User.findById(user._id).populate('friends', '_id');
            if (userWithFriends && userWithFriends.friends) {
                userWithFriends.friends.forEach(friend => {
                    if (broadcastFriendEvent) {
                        broadcastFriendEvent(friend._id, {
                            type: 'FRIEND_STATUS_UPDATE',
                            userId: user._id.toString(),
                            isOnline: true
                        });
                    }
                });
            }

            const token = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

            if (rememberMe) {
                res.cookie("authToken", token, {
                    maxAge: config.cookie.maxAge,
                    httpOnly: config.cookie.httpOnly
                });
            }

            return res.json({
                message: "Login successful",
                token,
                user: { id: user._id, email: user.email, name: user.name ,username:user.username,avatar:user.avatar}
            });
        }

        return res.status(401).json({ message: "Invalid credentials" });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Çıkış endpoint'i
export const userLogout = async (req, res) => {
    console.log("Logout isteği alındı. req.user._id:", req.user._id);
    if (req.user) {
        try {
            const user = await User.findById(req.user._id);
            console.log("User found:", user.email);
            if (user) {
                user.isOnline = false;
                await user.save();
                const userWithFriends = await User.findById(req.user._id).populate('friends', '_id');
                if (userWithFriends && userWithFriends.friends) {
                    userWithFriends.friends.forEach(friend => {
                        if (broadcastFriendEvent) {
                            broadcastFriendEvent(friend._id, {
                                type: 'FRIEND_STATUS_UPDATE',
                                userId: req.user._id.toString(),
                                isOnline: false
                            });
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Logout sırasında online durum güncelleme hatası:", error);
        }
    }
    res.clearCookie("authToken");
    return res.status(200).json({ message: "Logout successful" });
};

export { broadcastFriendEvent }; 

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

        //const errorMessage = "Invalid email or password";

        if (!user) {
            return res.status(401).json({ code: "AUTH_INVALID_CREDENTIALS" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ code: "AUTH_INVALID_CREDENTIALS" });
        }

        user.isOnline = true;
        await user.save();

        const userWithFriends = await User.findById(user._id).populate('friends', '_id');
        if (userWithFriends?.friends) {
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

        const token = jwt.sign(
            { id: user._id },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        if (rememberMe) {
            res.cookie("authToken", token, {
                maxAge: config.cookie.maxAge,
                httpOnly: config.cookie.httpOnly
            });
        }

        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ code: "INTERNAL_SERVER_ERROR" });
    }
};


export const userLogout = async (req, res) => {
    if (req.user) {
        try {
            const user = await User.findById(req.user._id);
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

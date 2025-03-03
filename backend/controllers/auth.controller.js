import bcrypt from 'bcrypt';
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // MongoDB modelini kullanıyoruz

// Giriş endpoint'i
export const userLogin = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email }); // MongoDB'den kullanıcıyı bul
        
        if (user && await bcrypt.compare(password, user.password)) { // Şifreyi karşılaştır
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
                user: { id: user._id, email: user.email, name: user.name }
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
    res.clearCookie("authToken");
    return res.status(200).json({ message: "Logout successful" });
};

import { users } from "../datas/users.js";
import bcrypt from 'bcrypt';
import config from "../config/config.js";
import jwt from "jsonwebtoken";
// Giriş endpoint'i
export const userLogin= async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const user = users.find((u) => u.email === email);
  
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id }, config.jwt.secret,  { expiresIn: config.jwt.expiresIn });
  
      if (rememberMe) {
        res.cookie("authToken", token, { maxAge: config.cookie.maxAge,
            httpOnly: config.cookie.httpOnly }); // 1 gün
      }
  
      return res.json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email,name: user.name },
      });
    }
  
    return res.status(401).json({ message: "Invalid credentials" });
  };
  
  // Çıkış endpoint'i
  export const userLogout= async (req, res) => {
    res.clearCookie("authToken");
    return res.status(200).json({ message: "Logout successful" });
  };
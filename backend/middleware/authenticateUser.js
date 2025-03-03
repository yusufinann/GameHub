import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import config from "../config/config.js";

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: "Yetkilendirme hatası. Lütfen giriş yapın." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Find user in MongoDB
    const user = await User.findById(decoded.id)
      .select('-password') // Exclude password from the returned user object
      .exec();
    
    if (!user) {
      return res.status(404).json({ 
        message: "Kullanıcı bulunamadı." 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Geçersiz token." 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token süresi dolmuş. Lütfen tekrar giriş yapın." 
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({ 
      message: "Kimlik doğrulama sırasında bir hata oluştu." 
    });
  }
};

export default authenticateUser;
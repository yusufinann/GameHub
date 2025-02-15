
import jwt from "jsonwebtoken";
import { users } from "../datas/users.js";
import config from "../config/config.js";
// Kullanıcı doğrulama middleware'i

const SECRET_KEY = "your_secret_key"; // Güçlü bir anahtar seçin
const authenticateUser = (req, res, next) => {
  const token =
    req.cookies.authToken || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Yetkilendirme hatası. Lütfen giriş yapın." });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    req.user = user; // Kullanıcı bilgisini request'e ekle
    next();
  } catch (err) {
    return res.status(401).json({ message: "Geçersiz token." });
  }
};

export default authenticateUser;
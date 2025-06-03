import mongoose from 'mongoose';
import User from '../models/user.model.js'; 

/**
 * Verilen kullanıcı ID'sine göre kullanıcı bilgilerini veritabanından alır.
 * @param {string} userId - Aranacak kullanıcının ID'si.
 * @returns {Promise<Object|null>} Kullanıcı bilgileri nesnesi veya bulunamazsa/hata olursa null.
 * Kullanıcı bilgileri şunları içerir: _id, username, name, avatar.
 */
export async function getUserDetails(userId) { // Fonksiyon adını daha açıklayıcı yapabiliriz
  try {
    // Mongoose ID geçerliliğini kontrol etmek iyi bir pratiktir
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.warn(`[UserService] Invalid userId format: ${userId}`);
        return null;
    }

    const user = await User.findById(userId).select('_id username name avatar').lean(); // .lean() performansı artırır

    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(), 
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error(`[UserService] Error fetching user info for userId ${userId}:`, error);
    return null;
  }
}
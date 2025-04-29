const lobbyChats = new Map();

/**
 * Yeni bir chat mesajını lobinin geçmişine ekler.
 * Eğer lobi için henüz bir geçmiş yoksa, yeni bir dizi oluşturur.
 *
 * @param {string} lobbyCode - Lobinin kodu.
 * @param {object} message - Chat mesajı objesi (gönderen bilgileri, mesaj içeriği vb.).
 */
export const storeMessage = (lobbyCode, message) => {
  let chatHistory = lobbyChats.get(lobbyCode) || [];
  chatHistory.push(message);
  lobbyChats.set(lobbyCode, chatHistory);
};

/**
 * Belirli bir lobinin chat geçmişini getirir.
 * Eğer lobi için geçmiş yoksa, boş bir dizi döner.
 *
 * @param {string} lobbyCode - Lobinin kodu.
 * @returns {array} - Lobinin chat geçmişi mesaj dizisi.
 */
export const getChatHistory = (lobbyCode) => {
  return lobbyChats.get(lobbyCode) || [];
};

/**
 * Bir lobinin chat geçmişini temizler.
 * Lobi silindiğinde veya geçmişi sıfırlamak gerektiğinde kullanılabilir.
 *
 * @param {string} lobbyCode - Lobinin kodu.
 */
export const clearChatHistory = (lobbyCode) => {
  lobbyChats.delete(lobbyCode);
};

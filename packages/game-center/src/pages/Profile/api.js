import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

// Axios instance oluşturuluyor ve yapılandırılıyor.
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Cookie tabanlı doğrulama gerekiyorsa:
  withCredentials: true
});

// Her isteğe, localStorage'dan alınan token'ı ekleyen interceptor.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Kullanıcı profilini getirir.
 * @param {string|number} userId - Kullanıcının ID'si.
 * @returns {Promise<Object>} Genişletilmiş kullanıcı verisi.
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    // Gelen veriye ek mock detayları ekliyoruz (veya backend gerçek veriyi döndürebilir):
    return {
      ...response.data,
      level: 42,
      xp: 8750,
      xpToNextLevel: 10000,
      memberSince: '2023-06-15',
      location: 'İstanbul, Türkiye',
      totalGames: 567,
      winRate: 68,
      achievements: [
        { id: 1, name: 'Bingo Ustası', icon: '🎯', date: '2024-01-15' },
        { id: 2, name: 'Hızlı Düşünür', icon: '⚡', date: '2024-02-20' },
        { id: 3, name: 'Sosyal Kelebek', icon: '🦋', date: '2024-03-01' }
      ],
      recentGames: [
        { id: 1, game: 'Bingo', result: 'Kazandı', score: 850, date: '2024-03-15' },
        { id: 2, game: 'Kelime Oyunu', result: 'Kaybetti', score: 720, date: '2024-03-14' },
        { id: 3, game: 'Bingo', result: 'Kazandı', score: 930, date: '2024-03-13' }
      ],
      stats: {
        totalWins: 386,
        totalLosses: 181,
        favoriteGame: 'Bingo',
        longestStreak: 12,
        currentStreak: 3
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error.response ? error.response.data : error;
  }
};

/**
 * Belirtilen kullanıcıya arkadaşlık isteği gönderir.
 * POST /friends/request
 * @param {string|number} targetUserId - İstek gönderilecek kullanıcının ID'si.
 * @returns {Promise<Object>} Sunucudan gelen yanıt.
 */
export const sendFriendRequest = async (targetUserId) => {
  try {
    const response = await api.post('/friends/request', { targetUserId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "An error occurred" };
  }
};

/**
 * Arkadaşlık isteğini kabul eder.
 * POST /friends/accept
 * @param {string|number} requesterId - İsteği gönderen kullanıcının ID'si.
 * @returns {Promise<Object>} Sunucudan gelen yanıt.
 */
export const acceptFriendRequest = async (requesterId) => {
  try {
    const response = await api.post('/friends/accept', { requesterId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "An error occurred" };
  }
};

/**
 * Arkadaşlık isteğini reddeder.
 * POST /friends/reject
 * @param {string|number} requesterId - İsteği gönderen kullanıcının ID'si.
 * @returns {Promise<Object>} Sunucudan gelen yanıt.
 */
export const rejectFriendRequest = async (requesterId) => {
  try {
    const response = await api.post('/friends/reject', { requesterId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "An error occurred" };
  }
};

/**
 * Arkadaşlıktan çıkarma (arkadaş silme) işlemi.
 * DELETE /friends/:friendId
 * @param {string|number} friendId - Arkadaşlık bağlantısının kaldırılacağı kullanıcının ID'si.
 * @returns {Promise<Object>} Sunucudan gelen yanıt.
 */
export const removeFriend = async (friendId) => {
  try {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "An error occurred" };
  }
};

/**
 * Mevcut kullanıcının arkadaş listesini getirir.
 * GET /friends/list
 * @returns {Promise<Array>} Arkadaş listesinin bulunduğu dizi.
 */
export const getFriendList = async () => {
  try {
    const response = await api.get('/friends/list');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "An error occurred" };
  }
};

/**
 * Gelen arkadaşlık isteklerini getirir.
 * GET /friends/request
 * (Not: Bu endpoint, arkadaşlık isteği gönderme ile aynı URL'i paylaşır fakat GET metodu kullanıldığında istekleri getirir.)
 * @returns {Promise<Array>} Gelen arkadaşlık isteklerinin bulunduğu dizi.
 */
export const getFriendRequests = async () => {
  try {
    const response = await api.get('/friends/request');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "An error occurred" };
  }
};

// Fonksiyonları bir nesne içerisinde dışa aktarıyoruz:
export const userApi = {
  getUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendList,
  getFriendRequests,
};

export default api;

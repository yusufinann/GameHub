import axios from 'axios';
import config from '../../config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
});

api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem('token');
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (error) => Promise.reject(error)
);

const buildUrl = (endpoint, ...params) => {
  return `${endpoint}/${params.join('/')}`;
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(buildUrl(config.apiEndpoints.userProfile, userId));
    return {
      ...response.data,
      level: 42,
      xp: 8750,
      achievements: [
        { id: 1, name: 'Bingo Ustası', icon: '🎯' }
      ]
    };
  } catch (error) {
    handleApiError(error, 'Kullanıcı profili alınamadı');
  }
};

export const friendService = {
  sendRequest: async (targetUserId) => {
    try {
      const response = await api.post(config.apiEndpoints.friendRequest, { targetUserId });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Arkadaşlık isteği gönderilemedi');
    }
  },

  acceptRequest: async (requesterId) => {
    try {
      const response = await api.post(config.apiEndpoints.friendAccept, { requesterId });
      return response.data;
    } catch (error) {
      handleApiError(error, 'İstek kabul edilemedi');
    }
  },

  getList: async () => {
    try {
      const response = await api.get(config.apiEndpoints.friendList);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Arkadaş listesi alınamadı');
    }
  }
};

export const gameService = {
  getBingoStats: async (userId) => {
    try {
      const response = await api.get(buildUrl(config.apiEndpoints.bingoStats, userId));
      return response.data;
    } catch (error) {
      handleApiError(error, 'Bingo istatistikleri alınamadı');
    }
  },

  getRecentGames: async (userId) => {
    try {
      const response = await api.get(buildUrl(config.apiEndpoints.games, userId, 'recent'));
      return response.data;
    } catch (error) {
      handleApiError(error, 'Son oyunlar alınamadı');
    }
  },
   getHangmanStats: async (userId) => {
    try {
      const response = await api.get(buildUrl(config.apiEndpoints.hangmanStats, userId));
      return response.data;
    } catch (error) {
      handleApiError(error, 'Hangman istatistikleri alınamadı');
    }
  },
   getGeneralGameStats: async (userId) => {
    try {
      const response = await api.get(buildUrl(config.apiEndpoints.generalGameStats, userId));
      return response.data;
    } catch (error) {
      handleApiError(error, 'Genel istatistikler alınamadı');
    }
  },
};

const handleApiError = (error, customMessage) => {
  console.error(`${customMessage}:`, error);
  const errorData = error.response?.data || {
    message: 'Beklenmeyen bir hata oluştu',
    code: 'UNKNOWN_ERROR'
  };
  throw new ApiError(errorData.message, errorData.code, error.response?.status);
};

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN_ERROR';
    this.status = status || 500;
  }
}

// API nesnesi
const apiClient = {
  user: {
    getUserProfile,
  },
  friendService,
  gameService,
};

export default apiClient;
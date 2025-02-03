import axios from 'axios';
import config from '../../config';

// Axios instance oluşturma
const api = axios.create({
  baseURL: config.apiBaseUrl, // API'nin base URL'i
});

// Her istek öncesi token'ı header'a ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hata yönetimi için interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Hatası:', error.response.data.message || error.message);
    } else {
      console.error('API Hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

// Lobby Api Calls
export const lobbyApi = {
  // Fetch All Lobbies
  fetchLobbies: async () => {
    try {
      const response = await api.get(config.apiEndpoints.lobbies);
      return response.data.lobbies;
    } catch (error) {
      throw error;
    }
  },

  //Create Lobby
  createLobbyApi: async (lobbyData) => {
    try {
      const response = await api.post(config.apiEndpoints.createLobby, lobbyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete Lobby
  deleteLobbyApi: async (lobbyCode) => {
    try {
      await api.delete(`${config.apiEndpoints.deleteLobby}/${lobbyCode}`);
    } catch (error) {
      throw error;
    }
  },
  // Leave Lobby
  leaveLobbyApi: async (lobbyCode, userId) => {
    try {
      const response = await api.post(`${config.apiEndpoints.leaveLobby}/${lobbyCode}`, { userId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
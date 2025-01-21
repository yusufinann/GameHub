import axios from 'axios';

// Axios instance oluşturma
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // API'nin base URL'i
});

// Her istek öncesi token'ı header'a ekleme
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Hata yönetimi için interceptor
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response) {
    console.error('API Hatası:', error.response.data.message || error.message);
  } else {
    console.error('API Hatası:', error.message);
  }
  return Promise.reject(error);
});

// Lobi ile ilgili API çağrıları
export const fetchLobbies = async () => {
  try {
    const response = await api.get('/lobbies');
    return response.data.lobbies;
  } catch (error) {
    throw error;
  }
};

export const createLobby = async (lobbyData) => {
  try {
    const response = await api.post('/lobbies/create', lobbyData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLobby = async (lobbyCode) => {
  try {
    await api.delete(`/lobbies/delete/${lobbyCode}`);
  } catch (error) {
    throw error;
  }
};


export default api;
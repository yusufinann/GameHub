import axios from "axios";
import config from "../../../../config";

// Axios instance oluştur
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token'ı header'a ekleyen interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lobiye katılma
export const joinLobby = async (lobbyCode, password = "") => {
  try {
    const response = await api.post(
      `${config.apiEndpoints.joinLobby}/${lobbyCode}`,
      { password }
    );
    return response.data;
  }
  catch (error) {
    let errorToThrow;
    if (error.response && error.response.data) {
      errorToThrow = new Error(error.response.data.message || 'API request failed');
      errorToThrow.data = error.response.data;
    } else {
      errorToThrow = new Error('An unexpected error occurred. Please try again.');
      errorToThrow.data = { errorKey: "common.error" }; 
    }
    throw errorToThrow; 
  }
};
export const getLobbyDetails = async (lobbyCode) => {
  try {
    // 2 saniye gecikme ekle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await api.get(
      `${config.apiEndpoints.lobbies}/${lobbyCode}`
    );
    return response.data.lobby;
  } catch (error) {
    throw error.response?.data?.message || "Lobi detayları alınamadı.";
  }
};
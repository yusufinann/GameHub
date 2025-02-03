import axios from "axios";
import config from "../../config.js";

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
    // 2 saniye gecikme ekle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await api.post(
      `${config.apiEndpoints.joinLobby}/${lobbyCode}`,
      { password }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Lobiye katılma başarısız.";
  }
};

// Lobi detaylarını getirme
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
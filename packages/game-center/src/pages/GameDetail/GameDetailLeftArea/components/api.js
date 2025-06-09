import axios from "axios";
import config from "../../../../config";

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
});


const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const fetchBingoPlayerStatsApi = async () => {
  try {
    const response = await apiClient.get(config.apiEndpoints.bingoPlayerStats, {
      headers: getAuthHeaders(),
    });
    return response.data; 
  } catch (error) {
    console.error("API Error - fetchBingoPlayerStatsApi:", error.response || error.message);
    throw error;
  }
};


export const fetchHangmanStatsApi = async () => {
  try {
    const response = await apiClient.get(config.apiEndpoints.hangmanStats, {
      headers: getAuthHeaders(),
    });
    return response.data; 
  } catch (error) {
    console.error("API Error - fetchHangmanStatsApi:", error.response || error.message);
    throw error; 
  }
};

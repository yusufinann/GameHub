import axios from "axios";
import config from "../../../config";

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (axiosConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Updates an existing lobby.
 * @param {string} lobbyCode - The unique code of the lobby to update.
 * @param {object} lobbyData - The updated lobby data payload.
 * @returns {Promise<object>} - The response data from the server.
 */
export const updateLobby = async (lobbyCode, lobbyData) => {
  try {
    const url = `${config.apiEndpoints.updateLobby}/${lobbyCode}`;
    const response = await apiClient.put(url, lobbyData);
    return response.data;
  } catch (error) {
    console.error("API Error updating lobby:", error.response || error);
    if (error.response && error.response.data) {
      const apiError = new Error(
        error.response.data.message ||
          (typeof error.response.data.messageKey === "string"
            ? error.response.data.messageKey
            : "API Error")
      );
      apiError.isApiError = true;
      apiError.data = error.response.data;
      apiError.status = error.response.status;
      throw apiError;
    }

    throw new Error(
      error.message ||
        "Failed to update lobby. Please check your network connection."
    );
  }
};

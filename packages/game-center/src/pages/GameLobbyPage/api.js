import axios from "axios";
import config from "../../config";


export const fetchLobbyDetails = async (link, token) => {
 
    return axios.get(
      `${config.apiBaseUrl}${config.apiEndpoints.lobbies}/${link}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
};
import axios from "axios";
import config from "../../config";


const getAuthHeaders = (token) => {
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchAllGroupsAPI = async (token) => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}${config.apiEndpoints.allChatGroups}`,
      getAuthHeaders(token)
    );
    return response.data; 
  } catch (error) {
    console.error("API Error fetching all groups:", error);
    throw error; 
  }
};

export const fetchUserGroupsAPI = async (token) => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}${config.apiEndpoints.userChatGroups}`,
      getAuthHeaders(token)
    );
    return response.data; 
  } catch (error) {
    console.error("API Error fetching user groups:", error);
    throw error;
  }
};

export const fetchCommunityChatHistoryAPI = async (token, page, limit) => {
  try {
    const response = await axios.get(
      `${config.apiBaseUrl}${config.apiEndpoints.communityChatHistory}?page=${page}&limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data; 
  } catch (error) {
    console.error("API Error fetching community chat history:", error);
    throw error;
  }
};

export const fetchGroupChatHistoryAPI = async (token, groupId, page, limit) => {
  if (!groupId) {
    console.error("Group ID missing for fetchGroupChatHistoryAPI");
    throw new Error("Group ID is required to fetch group chat history.");
  }
  try {
    const endpoint = config.apiEndpoints.groupChatHistory.replace(':groupId', groupId);
    const response = await axios.get(
      `${config.apiBaseUrl}${endpoint}?page=${page}&limit=${limit}`,
      getAuthHeaders(token)
    );
    return response.data; 
  } catch (error) {
    console.error("API Error fetching group chat history:", error);
    throw error;
  }
};
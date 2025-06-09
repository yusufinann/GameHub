// src/features/ConversationsPage/api.js (veya useConversationPage.js ile aynı dizin)
import axios from "axios";
import config from "../../config"; // config.js dosyanızın doğru yolunu belirtin

const getAuthHeaders = (token) => {
  if (!token) {
    console.warn("API call made without token.");
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Private Chat
export const fetchPrivateChatHistoryAPI = (token, receiverId, page, limit) => {
  const url = `${config.apiBaseUrl}${config.apiEndpoints.privateChatHistory}?receiverId=${receiverId}&page=${page}&limit=${limit}`;
  return axios.get(url, { headers: getAuthHeaders(token) });
};

// Friend Group Chat
export const fetchFriendGroupChatHistoryAPI = (token, groupId, page, limit) => {
  const url = `${config.apiBaseUrl}${config.apiEndpoints.friendGroupHistory.replace(':groupId', groupId)}?page=${page}&limit=${limit}`;
  return axios.get(url, { headers: getAuthHeaders(token) });
};

// Friend Groups (General)
export const fetchMyFriendGroupsAPI = (token) => {
  const url = `${config.apiBaseUrl}${config.apiEndpoints.myFriendGroups}`;
  return axios.get(url, { headers: getAuthHeaders(token) });
};

export const createFriendGroupAPI = (token, groupData) => {
  // groupData: { groupName, description, password, maxMembers, invitedFriends }
  const url = `${config.apiBaseUrl}${config.apiEndpoints.createFriendGroup}`;
  return axios.post(url, groupData, { headers: getAuthHeaders(token) });
};

export const fetchFriendGroupDetailsAPI = (token, groupId) => {
  const url = `${config.apiBaseUrl}${config.apiEndpoints.friendGroupDetails.replace(':groupId', groupId)}`;
  return axios.get(url, { headers: getAuthHeaders(token) });
};
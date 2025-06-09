import config from "../../../../config";

export const searchUsersApi = async (query) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for searching users');
      return []; 
    }

    const response = await fetch(`${config.apiBaseUrl}${config.apiEndpoints.userSearch}?username=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error; 
  }
};
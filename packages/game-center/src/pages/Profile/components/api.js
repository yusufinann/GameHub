import config from './config';

export const fetchBingoPlayerStats = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch player statistics.');
  }

  const token = localStorage.getItem('token');
  const url = `${config.apiBaseUrl}${config.apiEndpoints.bingoStats}/${userId}`;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      errorData = { message: response.statusText || `Request failed with status ${response.status}` };
    }
    const message = errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
};
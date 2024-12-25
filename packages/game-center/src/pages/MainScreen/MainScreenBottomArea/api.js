import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3005/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchGiveaways = async () => {
  try {
    const response = await apiClient.get('/giveaways');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch giveaways. Please try again later.'
    );
  }
};

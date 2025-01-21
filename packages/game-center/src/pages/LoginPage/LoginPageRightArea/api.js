import axios from 'axios';
import config from '../../../config';

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Login API
export async function login(credentials) {
  await delay(2000); // 2 saniye gecikme
  return apiClient.post(config.apiEndpoints.login, credentials);
}

// Validate token API
export async function validateToken(token) {
  return apiClient.get(config.apiEndpoints.user, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

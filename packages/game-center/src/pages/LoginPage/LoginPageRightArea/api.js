import axios from 'axios';
import config from '../../../config';

const apiBaseUrl = config.apiBaseUrl;
export function login(credentials) {
  return axios.post(apiBaseUrl + config.apiEndpoints.login, credentials);
}

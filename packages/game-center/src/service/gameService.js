import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiBaseUrl + config.apiEndpoints.mockGames,
});

export const fetchGames = ({ limit, offset } = {}) =>
  api.get(`?limit=${limit||''}&offset=${offset||''}`)
     .then(res => res.data);

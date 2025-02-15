import axios from 'axios';
import config from '../../../config';

const apiBaseUrl = config.apiBaseUrl;

export function fetchGiveaways() {
    return axios.get(apiBaseUrl + config.apiEndpoints.mockGames, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
}

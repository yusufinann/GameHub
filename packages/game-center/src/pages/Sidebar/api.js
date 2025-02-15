import axios from 'axios';
import config from '../../config';

const apiBaseUrl = config.apiBaseUrl;

// Oturum kapatma
export const logout = async () => {
  try {
    const response = await axios.post(`${apiBaseUrl}/api/auth/logout`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data; // Başarılı yanıtı döndür
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('Token geçersiz. Oturum sonlandırılıyor...');
    }
    throw error; // Hata durumunda hatayı fırlat
  }
};
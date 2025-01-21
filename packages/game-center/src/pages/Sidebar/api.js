import axios from 'axios';
import config from '../../config';

const apiBaseUrl = config.apiBaseUrl;

// Kullanıcı bilgilerini getirme
export const getUserData = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data; // Kullanıcı bilgilerini döndür
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error; // Hata durumunda hatayı fırlat
  }
};

// Oturum kapatma
export const logout = async () => {
  try {
    const response = await axios.post(`${apiBaseUrl}/logout`, null, {
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
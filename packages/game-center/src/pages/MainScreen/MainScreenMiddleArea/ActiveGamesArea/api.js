import config from "../../../../config";


export const fetchBingoPlayerStats = async (userId) => {
  if (!userId) {
    console.warn("fetchBingoPlayerStats: userId sağlanmadı.");
    throw new Error('Kullanıcı ID\'si istatistikleri getirmek için gereklidir.');
  }

  const token = localStorage.getItem('token');
  const url = `${config.apiBaseUrl}${config.apiEndpoints.bingoStats}/${userId}`;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn(`fetchBingoPlayerStats: Kullanıcı ${userId} için token bulunamadı. İstek yetkisiz olabilir.`);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: response.statusText || `İstek durumu ${response.status} ile başarısız oldu` };
      }
      const errorMessage = errorData.message || `HTTP hatası! Durum: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
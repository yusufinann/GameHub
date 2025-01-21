const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001', // Varsayılan API base URL
  apiEndpoints: {
    mockGames: '/giveaways', // Mock oyunlar için endpoint
    login: '/login', // Oturum açma endpoint'i
    logout: '/logout', // Oturum kapatma endpoint'i
    user: '/user', // Kullanıcı bilgilerini getirme endpoint'i
    lobbies: '/api/lobbies', // Lobi işlemleri için endpoint
    createLobby: '/api/lobbies/create', // Lobi oluşturma endpoint'i
    deleteLobby: '/api/lobbies/delete', // Lobi silme endpoint'i
    joinLobby: '/api/lobbies/join', // Lobiye katılma endpoint'i
  },
};

export default config;
const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001', // Varsayılan API base URL
  apiEndpoints: {
    mockGames: '/api/games', // Mock oyunlar için endpoint
    login: '/api/auth/login', // Oturum açma endpoint'i
    logout: '/api/auth/logout', // Oturum kapatma endpoint'i
    user: '/api/users/profile', // Kullanıcı bilgilerini getirme endpoint'i
    lobbies: '/api/lobbies', // Lobi işlemleri için endpoint
    createLobby: '/api/lobbies/create', // Lobi oluşturma endpoint'i
    deleteLobby: '/api/lobbies/delete', // Lobi silme endpoint'i
    joinLobby: '/api/lobbies/join', // Lobiye katılma endpoint'i
    leaveLobby:'/api/lobbies/leave'
  },
};

export default config;
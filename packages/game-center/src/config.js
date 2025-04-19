const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  apiEndpoints: {
    // Auth Endpoints
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    
    // User Endpoints
    user: '/api/users/profile',
    userProfile: '/api/users', 
    bingoStats: '/api/bingo/stats',
    
    // Friends Endpoints
    friendRequest: '/api/friends/request',
    friendAccept: '/api/friends/accept',
    friendReject: '/api/friends/reject',
    friendRemove: '/api/friends',
    friendList: '/api/friends/list',
    friendRequests: '/api/friends/requests',
    
    // Lobby Endpoints
    lobbies: '/api/lobbies',
    createLobby: '/api/lobbies/create',
    deleteLobby: '/api/lobbies/delete',
    joinLobby: '/api/lobbies/join',
    leaveLobby: '/api/lobbies/leave',
    
    // Game Endpoints
    mockGames: '/api/games'
  }
};

export default config;
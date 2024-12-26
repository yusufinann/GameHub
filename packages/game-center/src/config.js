const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3005/api',
  apiEndpoints: {
    mockGames: '/giveaways',
    login:'/login'
  },
};

export default config;

const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:3001",
  wsBaseUrl: process.env.REACT_APP_WS_BASE_URL || "ws://localhost:3001",
  apiEndpoints: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",

    user: "/api/users/profile",
    userProfile: "/api/users",
    userSearch: "/api/users/search",

    bingoStats: "/api/bingo/stats",
    hangmanStats: "/api/hangman/stats",
    generalGameStats: "/api/users/stats/overall",
    bingoPlayerStats: "/api/bingo/players-stats",
    bingoGameStats: "/api/bingo/stats",

    friendRequest: "/api/friends/request",
    friendAccept: "/api/friends/accept",
    friendReject: "/api/friends/reject",
    friendRemove: "/api/friends",
    friendList: "/api/friendlist",
    friendRequests: "/api/friends/requests",

    lobbies: "/api/lobbies",
    createLobby: "/api/lobbies/create",
    deleteLobby: "/api/lobbies/delete",
    joinLobby: "/api/lobbies/join",
    leaveLobby: "/api/lobbies/leave",
    updateLobby: "/api/lobbies/update",

    mockGames: "/api/games",

    allChatGroups: "/api/chat/groups",
    userChatGroups: "/api/chat/user-groups",
    communityChatHistory: "/api/chat/community",
    groupChatHistory: "/api/chat/groups/:groupId/history",

    privateChatHistory: "/api/chat/private-chat-history",
    friendGroupHistory: "/api/chat/friendgroup/:groupId/history",
    myFriendGroups: "/api/chat/friendgroups/me",
    createFriendGroup: "/api/chat/friendgroup",
    friendGroupDetails: "/api/chat/friendgroup/:groupId",
  },
};

export default config;
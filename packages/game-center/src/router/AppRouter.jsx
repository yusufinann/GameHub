import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainContainer from "../pages/MainContainer";
import MainScreen from "../pages/MainScreen";
import SettingsPage from "../pages/SettingsPage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./protectRoute";
import GameDetail from "../pages/GameDetail";
import Profile from "../pages/Profile";
import GameLobbyPage from "../pages/GameLobbyPage";
import CommunityPage from "../pages/CommunityPage";
import ConversationPage from "../pages/ConversationPage";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Main Container Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainContainer />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainScreen />} /> {/* Default middle */}
          <Route path="community" element={<CommunityPage />} />
          <Route
            path="/conversation/all/friend/:friendId"
            element={<ConversationPage />}
          />
          <Route
            path="/conversation/all/friend-group/:groupId"
            element={<ConversationPage />}
          />
          <Route path="/conversation/all" element={<ConversationPage />} />
          <Route
            path="/conversation/all/friend"
            element={<ConversationPage />}
          />
          <Route
            path="/conversation/all/friend-group"
            element={<ConversationPage />}
          />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="lobby/:link" element={<GameLobbyPage />} />
          <Route path="game-detail/:gameId" element={<GameDetail />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;

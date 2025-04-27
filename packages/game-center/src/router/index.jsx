import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoadingFallback from "./components/LoadingFallback.jsx";

const MainContainer = lazy(() => import("../pages/MainContainer"));
const MainScreen = lazy(() => import("../pages/MainScreen"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const GameDetail = lazy(() => import("../pages/GameDetail"));
const Profile = lazy(() => import("../pages/Profile"));
const GameLobbyPage = lazy(() => import("../pages/GameLobbyPage"));
const CommunityPage = lazy(() => import("../pages/CommunityPage"));
const ConversationPage = lazy(() => import("../pages/ConversationPage"));


const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </Router>
  );
};

export default AppRouter;
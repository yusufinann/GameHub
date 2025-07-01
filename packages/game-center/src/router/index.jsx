import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoadingFallback from "./components/LoadingFallback.jsx";
import RootLayout from "./components/RootLayout.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";

import { TurnNotificationProvider } from "../shared/components/GlobalTurnNotification/context.js";
import { LobbyProvider } from "../shared/context/LobbyContext/context.js";
import { WebSocketProvider } from "../shared/context/WebSocketContext/context.js";
import { SnackbarProvider } from "../shared/context/SnackbarContext.js";
import { GameSettingsProvider } from "../pages/GameDetail/GameDetailRightArea/context.js";
import { GlobalNotificationProvider } from "../pages/FriendsSidebar/context.js";
import { FriendsProvider } from "../shared/context/FriendsContext/context.js";

const MainContainer = lazy(() => import("../pages/MainContainer"));
const MainScreen = lazy(() => import("../pages/MainScreen"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const GameDetail = lazy(() => import("../pages/GameDetail"));
const Profile = lazy(() => import("../pages/Profile"));
const GameLobbyPage = lazy(() => import("../pages/GameLobbyPage"));
const CommunityPage = lazy(() => import("../pages/CommunityPage"));
const ConversationPage = lazy(() => import("../pages/ConversationPage"));


const GameRelatedLayout = () => (
  <GameSettingsProvider>
    <Outlet />
  </GameSettingsProvider>
);

const MainLayout = () => (
  <ProtectedRoute>
    <WebSocketProvider>
      <SnackbarProvider>
        <TurnNotificationProvider>
          <LobbyProvider>
            <GlobalNotificationProvider>
              <FriendsProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <MainContainer />
                </Suspense>
              </FriendsProvider>
            </GlobalNotificationProvider>
          </LobbyProvider>
        </TurnNotificationProvider>
      </SnackbarProvider>
    </WebSocketProvider>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/login",
        element: <Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>,
      },
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Suspense fallback={<LoadingFallback />}><MainScreen /></Suspense>,
          },
          {
            path: "community",
            element: <Suspense fallback={<LoadingFallback />}><CommunityPage /></Suspense>,
          },
          {
            path: "conversation/all",
            element: <Suspense fallback={<LoadingFallback />}><ConversationPage /></Suspense>,
          },
          {
            path: "conversation/all/friend",
            element: <Suspense fallback={<LoadingFallback />}><ConversationPage /></Suspense>,
          },
          {
            path: "conversation/all/friend/:friendId",
            element: <Suspense fallback={<LoadingFallback />}><ConversationPage /></Suspense>,
          },
          {
            path: "conversation/all/friend-group",
            element: <Suspense fallback={<LoadingFallback />}><ConversationPage /></Suspense>,
          },
          {
            path: "conversation/all/friend-group/:groupId",
            element: <Suspense fallback={<LoadingFallback />}><ConversationPage /></Suspense>,
          },
          {
            path: "profile/:userId",
            element: <Suspense fallback={<LoadingFallback />}><Profile /></Suspense>,
          },
          {
            element: <GameRelatedLayout />,
            children: [
              {
                path: "settings",
                element: <Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense>,
              },
              {
                path: "game-detail/:gameId",
                element: <Suspense fallback={<LoadingFallback />}><GameDetail /></Suspense>,
              },
              {
                path: "lobby/:link",
                element: <Suspense fallback={<LoadingFallback />}><GameLobbyPage /></Suspense>,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <Suspense fallback={<LoadingFallback />}><NotFoundPage /></Suspense>,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} fallbackElement={<LoadingFallback />} />;
};

export default AppRouter;
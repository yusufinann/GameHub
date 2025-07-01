import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import LoadingFallback from '../components/LoadingFallback.jsx';
import { GameSettingsProvider } from '../../pages/GameDetail/GameDetailRightArea/context.js';

const SettingsPage = lazy(() => import('../../pages/SettingsPage'));
const GameDetail = lazy(() => import('../../pages/GameDetail'));
const GameLobbyPage = lazy(() => import('../../pages/GameLobbyPage'));

const GameRelatedLayout = () => (
  <GameSettingsProvider>
    <Outlet />
  </GameSettingsProvider>
);

const gameRoutes = {
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
};

export default gameRoutes;
import React, { lazy, Suspense } from 'react';
import LoadingFallback from '../components/LoadingFallback.jsx';

const MainScreen = lazy(() => import('../../pages/MainScreen'));
const CommunityPage = lazy(() => import('../../pages/CommunityPage'));
const ConversationPage = lazy(() => import('../../pages/ConversationPage'));
const Profile = lazy(() => import('../../pages/Profile'));

const mainRoutes = [
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
];

export default mainRoutes;
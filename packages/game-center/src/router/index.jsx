import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoadingFallback from "./components/LoadingFallback.jsx";
import RootLayout from "./components/RootLayout.jsx";
import NotFoundPage from "./components/NotFoundPage.jsx";
import appRoutes from "./routes";
import AppProviders from "../shared/context/AppProviders.jsx";
import ErrorPage from "./components/ErrorPage.jsx";

const MainContainer = lazy(() => import("../pages/MainContainer"));
const LoginPage = lazy(() => import("../pages/LoginPage"));

const MainLayout = () => (
  <ProtectedRoute>
    <AppProviders>
      <Suspense fallback={<LoadingFallback />}>
        <MainContainer />
      </Suspense>
    </AppProviders>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage  />,
    children: [
      {
        path: "/login",
        element: <Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>,
      },
      {
        element: <MainLayout />,
        children: appRoutes,
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
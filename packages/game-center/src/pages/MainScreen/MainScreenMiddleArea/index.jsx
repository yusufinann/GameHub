import React, { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

// Lazy-loaded components
const ActiveGamesArea = lazy(() => import("./ActiveGamesArea"));
const LobbiesArea = lazy(() => import("./LobbiesArea"));
const BingoStatsSchema = lazy(() => import("./ActiveGamesArea/BingoStatsSchema"));
const GameStories = lazy(() => import("./ActiveGamesArea/GameStories"));
const PopularGamesArea = lazy(() => import("./PopularGamesArea"));

// Loading spinner component
const LoadingSpinner = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
      minHeight: "200px",
    }}
  >
    <CircularProgress />
  </Box>
);

function MainScreenMiddleArea() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        marginTop: "20px",
        height: "100%",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: "10px",
          height: "100%",
          width: "100%",
        }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <PopularGamesArea />
        </Suspense>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "50vw",
            height: "70vh",
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <LobbiesArea />
          </Suspense>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: "10px",
        }}
      >
        {/* Alt Sol */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "100vh",
            width: "60vw",
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveGamesArea />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <GameStories />
          </Suspense>
        </Box>

        {/* Alt Sağ */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "100vh",
            width: "50vw",
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <BingoStatsSchema />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

export default MainScreenMiddleArea;

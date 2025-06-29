import React, { lazy, Suspense, memo } from "react"; // memo'yu import edin
import { Box, CircularProgress } from "@mui/material";

const ActiveGamesArea = lazy(() => import("./ActiveGamesArea"));
const LobbiesArea = lazy(() => import("./LobbiesArea"));
const BingoStatsSchema = lazy(() => import("./ActiveGamesArea/BingoStatsSchema"));
const GameStories = lazy(() => import("./ActiveGamesArea/GameStories"));
const PopularGamesArea = lazy(() => import("./PopularGamesArea"));

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
        gap: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: "20px",
          width: "100%",
        }}
      >
        <Box sx={{ width: { xs: '100%', md: '50%'} }}>
          <Suspense fallback={<LoadingSpinner />}>
            <PopularGamesArea />
          </Suspense>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: { xs: '100%', md: '60%' },
            height: { xs: '100%', md: '70vh' },
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
          gap: "20px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: { xs: '100%', md: '60%' },
            height: 'auto',
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveGamesArea />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <GameStories />
          </Suspense>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: { xs: '100%', md: '40%' },
            height: 'auto',
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

export default memo(MainScreenMiddleArea);
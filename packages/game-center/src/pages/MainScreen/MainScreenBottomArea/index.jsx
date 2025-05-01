import React, { Suspense, lazy } from "react";
import { Box, CircularProgress, useTheme } from "@mui/material";
import Header from "./Header";
//import WhatshotIcon from "@mui/icons-material/Whatshot";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const HighlightsSection = lazy(() =>
  import("./HighlightsSection/HighlightsSection")
);
const BrowseGames = lazy(() => import("./BrowseGames/BrowseGames"));
const TrendGamesList = lazy(() => import("./TrendGamesList/TrendGamesList"));

function MainScreenBottomArea() {
  const theme = useTheme();

  const LoadingSpinner = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ width: "100%",mt:4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Suspense fallback={<LoadingSpinner />}>
          {/* <Header
            title={"Highlights and Recommended"}
            theme={theme}
            icon={<WhatshotIcon />}
          /> */}
          <HighlightsSection />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <Header
            title={"Browse Games"}
            theme={theme}
            icon={<NewReleasesIcon />}
          />
          <BrowseGames />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <Header
            title={"Trend Games"}
            theme={theme}
            icon={<TrendingUpIcon />}
          />
          <TrendGamesList />
        </Suspense>
      </Box>
    </Box>
  );
}

export default MainScreenBottomArea;

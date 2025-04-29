import React, { Suspense } from "react";
import { Box, CircularProgress, useTheme } from "@mui/material";
import Header from "./Header";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HighlightsSection from "./HighlightsSection/HighlightsSection";
import BrowseGames from "./BrowseGames/BrowseGames";
import TrendGamesList from "./TrendGamesList/TrendGamesList";

function MainScreenBottomArea() {
  const theme = useTheme();
 
  const LoadingSpinner = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
  
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Box>
            <Header
              title={"Highlights and Recommended"}
              theme={theme}
              icon={<WhatshotIcon />}
            />
            <Box
              sx={{
                display: "flex",
                gap: 3,
              }}
            >
              <HighlightsSection />
            </Box>
          </Box>
          <Box>
            <Header
              title={"Browse Games"}
              theme={theme}
              icon={<NewReleasesIcon />}
            />

            <BrowseGames />
          </Box>
          <Box>
            <Header
              title={"Trend Games"}
              theme={theme}
              icon={<TrendingUpIcon />}
            />
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  width: "100%",
                  justifyContent:'center',
                  alignItems:'center',
                  '& > *': {
                    flexBasis: {
                      xs: "100%",
                      sm: "calc(33.333% - 16px)",
                      md: "calc(20% - 19.2px)",
                    },
                    flexGrow: 0,
                    flexShrink: 0,
                  
                  }
                }}
              >
                <TrendGamesList />
              </Box>
            </Box>
          </Box>
        </Suspense>
      </Box>
    </Box>
  );
}

export default MainScreenBottomArea;
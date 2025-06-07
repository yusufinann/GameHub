import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { gameData } from "../../../utils/constants";
import Header from "./components/Header";
import HeaderContent from "./components/HeaderContent";
import { getSlidesData } from "./slideData"; 
import { useMainScreenSlideshow } from "./useMainScreenSlideshow";

const MainScreenHeader = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const theme = useTheme();

  const slides = getSlidesData(theme);

  const {
    currentSlideIndex,
    navigateToSlide,
    pauseAutoplay,
    resumeAutoplay,
  } = useMainScreenSlideshow(slides.length);

  const currentSlide = slides[currentSlideIndex];
  const currentColor = currentSlide?.color || theme.palette.primary.main;

  useEffect(() => {
    if (gameData && gameData.length > 0) {
      setSelectedGame(gameData[0]);
    }
  }, []);

  if (!selectedGame && gameData && gameData.length > 0) return null;
  if (slides.length === 0) return null;

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "24px",
        p: 1,
        background: theme.palette.background.gradientFadeBg,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "120%", 
          height: "120%",
          background: theme.palette.background.stripeBg,
          opacity: 0.3,
          zIndex: 1,
        }}
      />

      <Box 
        sx={{
          position: "relative",
          zIndex: 2, 
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Header theme={theme} currentSlideColor={currentColor} />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
        >
          <Box
            sx={{
              display: "flex",
              height: { xs: "20vh", sm: "30vh", md: "35vh" },
            }}
          >
            <HeaderContent
              theme={theme}
              slides={slides} 
              activeSlideIndex={currentSlideIndex}
              onSlideNavigation={navigateToSlide}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainScreenHeader;
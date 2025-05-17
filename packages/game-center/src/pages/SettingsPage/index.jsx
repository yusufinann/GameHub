import React from "react";
import { Box, Container } from "@mui/material";
import ThemeCard from "./components/ThemeCard";
import LanguageCard from "./components/LanguageCard";
import VolumeCard from "./components/VolumeCard";
import Header from "./components/Header";
import useSettingsPage from "./useSettingsPage";

const SettingsPage = () => {
  const {
    theme,
    isDarkMode,
    isNeonOceanMode,
    handleThemeChange,
    language,
    handleLanguageChange,
    bingoSoundEnabled,
    toggleBingoSound,
    hangmanSoundEnabled,
    toggleHangmanSound,
    animateCards,
    showSaveIndicator,
    decorationGradient,
  } = useSettingsPage();

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        py: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: decorationGradient,
          filter: "blur(60px)",
          opacity: 0.6,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-5%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: decorationGradient,
          filter: "blur(80px)",
          opacity: 0.4,
          zIndex: 0,
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Header
          language={language}
          theme={theme}
          showSaveIndicator={showSaveIndicator}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", mx: -2 }}>
          <ThemeCard
            isDarkMode={isDarkMode}
            isNeonOceanMode={isNeonOceanMode}
            handleThemeChange={handleThemeChange}
            language={language}
            animateCards={animateCards}
          />
          <LanguageCard
            language={language}
            handleLanguageChange={handleLanguageChange}
            animateCards={animateCards}
          />
          <VolumeCard
            bingoSoundEnabled={bingoSoundEnabled}
            toggleBingoSound={toggleBingoSound}
            hangmanSoundEnabled={hangmanSoundEnabled}
            toggleHangmanSound={toggleHangmanSound}
            animateCards={animateCards}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;

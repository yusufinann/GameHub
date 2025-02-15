import React, { useState, useEffect } from "react";
import {
  Box,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { gameData } from "../../../utils/constants";
import GameList from "./components/GameList";
import GameInfo from "./components/GameInfo";
import Header from "./components/Header";
import BackgroundLayer from "./components/BackgroundLayer";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
      dark: "#2E7D32",
      light: "#81C784",
    },
    secondary: {
      main: "#2196F3",
      dark: "#1565C0",
      light: "#64B5F6",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const MainScreenHeader = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    setSelectedGame(gameData[0]);
  }, []);

  if (!selectedGame) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box
    //onMouseEnter={() => setIsHovered(true)}
   // onMouseLeave={() => setIsHovered(false)}
        sx={{
          minHeight: "20vh",
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Background Layer */}
       <BackgroundLayer theme={theme} selectedGame={selectedGame} isHovered={isHovered} /> 
        {/* Content Layer */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            p: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Header/>
          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              gap: 2,
              flexDirection: isMediumScreen ? "column" : "row",
              overflow: "hidden",
            }}
          >
            {/* Game Info Section */}
            <GameInfo selectedGame={selectedGame} theme={theme} />
            {/* Game List Section */}
            <GameList
              isMediumScreen={isMediumScreen}
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              theme={theme}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainScreenHeader;

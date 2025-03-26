import React, { useState, useEffect } from "react";
import {
  Box,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { gameData } from "../../../utils/constants";
import Header from "./components/Header";
import MainScreenContent from "./components/MainScreenContent "; 

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
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    setSelectedGame(gameData[0]);
  }, []);

  if (!selectedGame) return null;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "50vh",
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "rgb(50,135,97)",
          display: "flex",
          flexDirection: "column",
        }}
      >        
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)",
            zIndex: 1
          }}
        />
        
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
          <Header />
          
          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              gap: 2,
              flexDirection: isMediumScreen ? "column" : "row",
              overflow: "hidden",
              mt: 2,
            }}
          >
            {/* Main Content Area - Now using our new component */}
            <MainScreenContent />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default MainScreenHeader;
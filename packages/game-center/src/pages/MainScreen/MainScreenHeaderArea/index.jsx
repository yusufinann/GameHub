import React, { useState, useEffect } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { gameData } from "../../../utils/constants";
import Header from "./components/Header";
import MainScreenContent from "./components/MainScreenContent "; 



const MainScreenHeader = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const theme=useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    setSelectedGame(gameData[0]);
  }, []);

  if (!selectedGame) return null;

  return (
      <Box
        sx={{
          minHeight: "50vh",
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor:  theme.palette.background.stripeBg,
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
            background:  theme.palette.background.stripe,
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
            <MainScreenContent theme={theme}/>
          </Box>
        </Box>
      </Box>
  );
};
export default MainScreenHeader;
import React from "react";
import { Box } from "@mui/material";
import ActiveGamesArea from "./ActiveGamesArea";
import LobbiesArea from "./LobbiesArea";
import BingoStatsSchema from "./ActiveGamesArea/BingoStatsSchema";
import GameStories from "./ActiveGamesArea/GameStories";
import PopularGamesArea from "./PopularGamesArea";

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
        <PopularGamesArea />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "50vw",
            height: "70vh",         
          }}
        >
          <LobbiesArea />
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
          <ActiveGamesArea />
          <GameStories />
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
          <BingoStatsSchema />
        </Box>
      </Box>
    </Box>
  );
}

export default MainScreenMiddleArea;

import React from "react";
import { Box} from "@mui/material";
import CreateLobbyArea from "./CreateLobbyArea";
import ActiveGamesArea from "./ActiveGamesArea";
import LobbiesArea from "./LobbiesArea";
function MainScreenMiddleArea() {

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column", // Küçük ekranlarda dikey düzen
          md: "row",    // Daha büyük ekranlarda yatay düzen
        },
        marginTop: "20px",
        gap: "10px",
        height: "100%",
        width: "100%",
      }}
    >
      <CreateLobbyArea />
      <ActiveGamesArea/>
      <LobbiesArea />
    </Box>
  );
}

export default MainScreenMiddleArea;

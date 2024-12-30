import { Box } from "@mui/material";
import React from "react";
import MainScreenMiddleLeft from "./components/MainScreenMiddleAreaItems/MainScreenMiddleLeft";
import MainScreenMiddleRight from "./components/MainScreenMiddleAreaItems/MainScreenMiddleRight/MainScreenMiddleRight";
function MainScreenMiddleArea() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column", // Küçük ekranlarda alt alta
          sm: "column", // Orta küçük ekranlarda da alt alta
          md: "row",    // Daha büyük ekranlarda yan yana
        },
        marginTop: "20px",
        gap: "10px",
        height: "100%",
        width: "100%",
      }}
    >
        <MainScreenMiddleLeft />
      
      <MainScreenMiddleRight />
    </Box>
  );
}

export default MainScreenMiddleArea;

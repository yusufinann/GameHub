import React from "react";
import { Box} from "@mui/material";
import MainScreenMiddleLeft from "./MainScreenMiddleAreaItems/MainScreenMiddleLeft";
import MainScreenMiddleRight from "./MainScreenMiddleAreaItems/MainScreenMiddleRight/MainScreenMiddleRight";

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
      <MainScreenMiddleLeft />
      <MainScreenMiddleRight />
    </Box>
  );
}

export default MainScreenMiddleArea;

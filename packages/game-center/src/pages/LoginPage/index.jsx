import { Box } from "@mui/material";
import React from "react";
import LoginPageLeftArea from "./LoginPageLeftArea";
import LoginPageRightArea from "./LoginPageRightArea";

function LoginPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        height: "100vh",        
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          //backgroundColor: "rgb(165, 249, 190)",
          width: "60vw",
          height: "70vh",
          padding: "20px",
          borderRadius: "20px",
        }}
      >
        <LoginPageLeftArea />
        <LoginPageRightArea/>
      </Box>
    </Box>
  );
}

export default LoginPage;
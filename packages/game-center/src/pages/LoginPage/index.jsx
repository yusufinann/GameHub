import { Box, useTheme } from "@mui/material";
import React from "react";
import LoginPageLeftArea from "./LoginPageLeftArea";
import LoginPageRightArea from "./LoginPageRightArea";

function LoginPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: theme.palette.background.gradient,
        padding: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: { xs: "100%", sm: "90%", md: "85%", lg: "75%" },
          height: { xs: "90%", sm: "80%", md: "75%" },
          maxWidth: "1400px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: `0 10px 40px ${theme.palette.background.elevation[2]}`,
          position: "relative",
        }}
      >
        <LoginPageLeftArea />
        <LoginPageRightArea />
      </Box>
    </Box>
  );
}

export default LoginPage;
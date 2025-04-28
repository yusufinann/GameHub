import { Box, useTheme} from "@mui/material";
import React from "react";
import LoginPageLeftArea from "./LoginPageLeftArea";
import LoginPageRightArea from "./LoginPageRightArea";

function LoginPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: isDarkMode 
          ? "linear-gradient(135deg, #0f1924 0%, #162339 100%)"
          : "linear-gradient(135deg, #e8f5e9 0%, #a5f9be 100%)",
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
          boxShadow: isDarkMode
            ? "0 10px 40px rgba(0, 0, 0, 0.5)"
            : "0 10px 40px rgba(0, 0, 0, 0.15)",
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
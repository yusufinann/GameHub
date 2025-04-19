import React from "react";
import { Box, Typography, useTheme, Paper, keyframes } from "@mui/material";
import noActiveLobbies from "../../../../assets/noActiveLobbies-bg.png";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function NoActiveLobbies() {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: theme.palette.background.gradient,
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.1,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        <Box
          component="img"
          src={noActiveLobbies}
          alt="No Active Lobbies"
          sx={{
            width: 200,
            height: 200,
            opacity: 0.7,
            animation: `${fadeIn} 0.6s ease-out`,
          }}
        />
      </Box>

      <Box
        sx={{
          textAlign: "center",
          animation: `${fadeIn} 0.6s ease-out 0.2s both`,
          px: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.common.white,
            mb: 2,
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          No Active Lobbies
        </Typography>
      </Box>
    </Paper>
  );
}

export default NoActiveLobbies;

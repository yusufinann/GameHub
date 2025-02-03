import React from "react";
import {
  Box,
  Typography,
  keyframes,
} from "@mui/material";
import PeopleAlt from "@mui/icons-material/PeopleAlt";
import SportsEsports from "@mui/icons-material/SportsEsports";
import Widgets from "@mui/icons-material/Widgets";

// Define keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0) rotateX(0); }
  25% { transform: translateY(-20px) rotateX(20deg); }
  75% { transform: translateY(20px) rotateX(-20deg); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const wave = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
`;

const JoiningLobbyAnimation = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        perspective: "1000px",
      }}
    >
      {/* Central portal effect */}
      <Box
        sx={{
          position: "relative",
          width: 200,
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Orbiting circles */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            animation: `${spin} 10s linear infinite`,
            willChange: "transform",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                transform: `rotate(${i * 45}deg)`,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: (theme) => theme.palette.primary.main,
                  animation: `${bounce} 2s infinite ${i * 0.2}s`,
                  filter: "blur(4px)",
                  willChange: "transform, opacity",
                },
              }}
            />
          ))}
        </Box>

        {/* Central element with icons */}
        <Box
          sx={{
            width: 80,
            height: 80,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            willChange: "transform",
          }}
        >
          <PeopleAlt
            sx={{
              fontSize: 40,
              color: "primary.main",
              animation: `${pulse} 1.5s ease-in-out infinite`,
              willChange: "transform, opacity",
            }}
          />
          <SportsEsports
            sx={{
              fontSize: 40,
              color: "secondary.main",
              animation: `${pulse} 1.5s ease-in-out infinite 0.5s`,
              willChange: "transform, opacity",
            }}
          />
          <Widgets
            sx={{
              fontSize: 40,
              color: "success.main",
              animation: `${pulse} 1.5s ease-in-out infinite 1s`,
              willChange: "transform, opacity",
            }}
          />
        </Box>
      </Box>

      {/* Wave text effect */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {"JOINING THE LOBBY".split("").map((letter, i) => (
          <Typography
            key={i}
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              animation: `${wave} 1.2s infinite ${i * 0.04}s`,
              textShadow: "0 0 10px rgba(25, 118, 210, 0.5)",
              willChange: "transform",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </Typography>
        ))}
      </Box>

      {/* Energy particles */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: `${float} ${3 + Math.random() * 2}s infinite ${Math.random() * 2}s`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.8,
            filter: "blur(2px)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </Box>
  );
};

export default JoiningLobbyAnimation;
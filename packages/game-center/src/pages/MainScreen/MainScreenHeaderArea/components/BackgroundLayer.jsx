import {
  Box,
  alpha,
} from "@mui/material";
import React from "react";
const BackgroundLayer = React.memo(function BackgroundLayer({ theme, selectedGame, isHovered }) {
  return (
    <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(to top, ${alpha(
                theme.palette.primary.dark,
                0.9
              )}, transparent)`,
              zIndex: 1,
            },
          }}
        >
          {isHovered ? (
  <Box
    component="img"
    loading="lazy"
    src={selectedGame?.gif}
    alt={selectedGame?.title}
    sx={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.3s ease-in-out",
      transform: "scale(1.05)",
    }}
  />
) : (
  <Box
    component="div"
    sx={{
      width: "100%",
      height: "100%",
      transition: "transform 0.3s ease-in-out",
      transform: "scale(1)",
    }}
  />
)}
        </Box>
  )
});

export default BackgroundLayer
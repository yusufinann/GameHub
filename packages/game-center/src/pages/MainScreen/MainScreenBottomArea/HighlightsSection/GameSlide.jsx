import React from "react";
import { Box, Typography, IconButton, Chip, Button } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LaunchIcon from "@mui/icons-material/Launch";

const GameSlide = ({ game, theme, handlePrevSlide, handleNextSlide }) => {
  return (
    <Box
      sx={{
        minWidth: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
      }}
    >
      <IconButton
        onClick={handlePrevSlide}
        sx={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: 0,
          height: "100%",
          width: "36px",
          zIndex: 10,
          color: "white",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <Box
        sx={{
          width: "65%",
          height: "100%",
          position: "relative",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${game.images.main})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </Box>
      <Box
        sx={{
          width: "35%",
          height: "100%",
          backgroundColor: theme.palette.primary.medium,
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            padding: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: theme.palette.primary.dark,
          }}
        >
          <Typography variant="h4" sx={{ color: "white", fontWeight: 600 }}>
            {game.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.secondary.gold }}
            >
              {game.status}
            </Typography>
            {game.tag && (
              <Chip
                label={game.tag}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.darker,
                  color: "white",
                  fontSize: "0.75rem",
                  height: "24px",
                }}
              />
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            padding: "8px",
            flex: 1,
            overflow: "auto",
          }}
        >
          {game.images.thumbnails.map((thumbnail, idx) => (
            <Box
              key={idx}
              sx={{
                width: "100%",
                height: "120px",
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={thumbnail}
                alt={`${game.title} screenshot ${idx + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theme.palette.primary.darker,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {game.platforms.includes("windows") && (
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "white" }}
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </Box>
            )}
            {game.platforms.includes("mac") && (
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "white" }}
                >
                  <path d="M9 2h6l1 7h-8z"></path>
                  <path d="M4 14.5c0 3.5 2 6.5 5 6.5h6c3 0 5-3 5-6.5 0-3-1-5.5-3.5-5.5h-9c-2.5 0-3.5 2.5-3.5 5.5z"></path>
                </svg>
              </Box>
            )}
            {game.platforms.includes("linux") && (
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "white" }}
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            size="small"
            endIcon={<LaunchIcon />}
            href={game.browse}
            target="_blank"
            sx={{
              backgroundColor: theme.palette.secondary.main || "#FF9800",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: theme.palette.secondary.dark || "#F57C00",
              },
              fontSize: "0.8rem",
              height: "32px",
              minWidth: "80px",
              padding: "4px 12px",
            }}
          >
            Browse
          </Button>
        </Box>
      </Box>
      <IconButton
        onClick={handleNextSlide}
        sx={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.3)",
          borderRadius: 0,
          height: "100%",
          width: "36px",
          zIndex: 10,
          color: "white",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default GameSlide;

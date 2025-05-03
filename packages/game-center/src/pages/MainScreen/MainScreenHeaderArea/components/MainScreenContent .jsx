import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import gameOfThrones from "../../../../assets/headerGame3.png";
import fortnite from "../../../../assets/fortnite-removebg.png";
import oblivion from "../../../../assets/oblivion-removebg.png";

const MainScreenContent = ({ theme }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      id: 1,
      title: "Play Together, Connect Everywhere",
      buttonText: "JOIN NOW",
      characterImg: gameOfThrones
    },
    {
      id: 2,
      title: "Live Lobbies, Instant Battles",
      buttonText: "START PLAYING",
      characterImg: fortnite
    },
    {
      id: 3,
      title: "Game. Connect. Conquer.",
      buttonText: "ENTER GAME ZONE",
      characterImg: oblivion
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  
  return (
    <Box sx={{ position: "relative", flex: 1, overflow: "hidden" }}>
      {slides.map((slide, index) => (
        <Box
          key={slide.id}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: index === currentSlide ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
            display: "flex",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: theme.shadows[8]
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.8
            }}
          />

          {/* Decorative gradient overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1
            }}
          />

          {/* Character image and floating icons */}
          <Box sx={{ position: "relative", width: "40%", display: { xs: "none", sm: "block" }, zIndex: 2 }}>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: "10%",
                height: "100%",
                width: "auto",
                maxWidth: "80%",
                display: "flex",
                justifyContent: "center",
                filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))"
              }}
            >
              <img
                src={slide.characterImg}
                alt="Game character"
                style={{ height: "100%", width: "auto", objectFit: "contain" }}
              />
            </Box>
          </Box>

          {/* Text and CTA content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: { xs: "center", sm: "flex-start" },
              pl: { xs: 2, sm: 0 },
              pr: 2,
              zIndex: 2
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.75rem" },
                mb: 4,
                textAlign: { xs: "center", sm: "left" },
                textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                background: theme.palette.text.contrast,
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent",
                display: "inline-block"
              }}
            >
              {slide.title}
            </Typography>

            <Button
              variant="contained"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.gold} 30%, ${theme.palette.secondary.gold}CC 90%)`,
                color: theme.palette.text.primary,
                fontWeight: "bold",
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                py: 1.5,
                px: 4,
                borderRadius: 10,
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.secondary.gold}E0 30%, ${theme.palette.secondary.gold} 90%)`,
                  boxShadow: "0 6px 12px rgba(0,0,0,0.3)"
                },
                transition: "all 0.3s ease"
              }}
            >
              {slide.buttonText}
            </Button>
          </Box>
        </Box>
      ))}

      {/* Navigation dots */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
          zIndex: 10
        }}
      >
        {slides.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrentSlide(i)}
            sx={{
              width: i === currentSlide ? 16 : 12,
              height: i === currentSlide ? 16 : 12,
              borderRadius: "50%",
              bgcolor: i === currentSlide ? theme.palette.secondary.gold : theme.palette.primary.light,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: i === currentSlide ? "0 0 8px rgba(255,209,102,0.7)" : "none"
            }}
          />
        ))}
      </Box>

      {/* Arrow navigation */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.palette.common.white,
          bgcolor: theme.palette.primary.darker + "80",
          "&:hover": {
            bgcolor: theme.palette.primary.darker,
            transform: "translateY(-50%) scale(1.1)"
          },
          zIndex: 10,
          transition: "all 0.2s ease"
        }}
      >
        <ArrowBackIos />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.palette.common.white,
          bgcolor: theme.palette.primary.darker + "80",
          "&:hover": {
            bgcolor: theme.palette.primary.darker,
            transform: "translateY(-50%) scale(1.1)"
          },
          zIndex: 10,
          transition: "all 0.2s ease"
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      {/* Slide counter */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          bgcolor: theme.palette.primary.darker + "CC",
          color: theme.palette.common.white,
          px: 1.5,
          py: 0.5,
          borderRadius: 8,
          fontSize: "0.875rem",
          zIndex: 10,
          backdropFilter: "blur(5px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}
      >
        {currentSlide + 1} / {slides.length}
      </Box>
    </Box>
  );
};

export default MainScreenContent;
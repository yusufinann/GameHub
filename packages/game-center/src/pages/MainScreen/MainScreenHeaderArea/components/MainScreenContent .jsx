import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import olymposImage from "../../../../assets/olympos-removebg.png";
import fortnite from "../../../../assets/fortnite-removebg.png";
import oblivion from "../../../../assets/oblivion-removebg.png";
const MainScreenContent = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Play Together, Connect Everywhere",
      buttonText: "JOIN NOW",
      characterImg: olymposImage,
      gameIcons: [
        { name: "Sweet Bonanza", img: "https://wallpapercave.com/uwp/uwp4706340.jpeg" },
        { name: "Gates of Olympus", img: "https://wallpapercave.com/wp/wp10779463.jpg" },
        { name: "Starlight Princess", img: "https://wallpapercave.com/wp/wp10779482.jpg" }
      ],
      bgColor: "rgb(50,135,97)"
    },
    {
      id: 2,
      title: "Live Lobbies, Instant Battles",
      buttonText: "START PLAYING",
      characterImg: fortnite,
      gameIcons: [
        { name: "Wolf Gold", img: "https://wallpapercave.com/uwp/uwp4687385.jpeg" },
        { name: "Big Bass", img: "https://wallpapercave.com/uwp/uwp4706340.jpeg" },
        { name: "Fruit Party", img: "https://wallpapercave.com/wp/wp10779473.jpg" }
      ],
      //bgColor: "rgb(75,60,145)"
       bgColor: "rgb(50,135,97)"
    },
    {
      id: 3,
      title: "Game. Connect. Conquer.",
      buttonText: "ENTER GAME ZONE",
      characterImg: oblivion,
      gameIcons: [
        { name: "Book of Dead", img: "https://wallpapercave.com/uwp/uwp4698863.jpeg" },
        { name: "Gonzo's Quest", img: "https://wallpapercave.com/wp/wp10779463.jpg" },
        { name: "Reactoonz", img: "https://wallpapercave.com/wp/wp10779473.jpg" }
      ],
    //   bgColor: "rgb(190,30,45)"
     bgColor: "rgb(50,135,97)"
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
            bgcolor: slide.bgColor,
            borderRadius: 2,
            overflow: "hidden"
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
              background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)"
            }}
          />

          {/* Character image and floating icons */}
          <Box sx={{ position: "relative", width: "40%", display: { xs: "none", sm: "block" } }}>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: "10%",
                height: "90%",
                width: "auto",
                maxWidth: "80%",
                display: "flex",
                justifyContent: "center"
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
              variant="h3"
              component="h2"
              sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.75rem" },
                mb: 4,
                textAlign: { xs: "center", sm: "left" },
                textShadow: "0 0 10px rgba(0,0,0,0.3)"
              }}
            >
              {slide.title}
            </Typography>

            <Button
              variant="contained"
              sx={{
                bgcolor: "#FFD700",
                color: "black",
                fontWeight: "bold",
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                py: 1.5,
                px: 4,
                borderRadius: 10,
                "&:hover": {
                  bgcolor: "#FFC000"
                }
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
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: i === currentSlide ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.3s ease"
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
          color: "white",
          bgcolor: "rgba(0,0,0,0.3)",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.5)"
          },
          zIndex: 10
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
          color: "white",
          bgcolor: "rgba(0,0,0,0.3)",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.5)"
          },
          zIndex: 10
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
          bgcolor: "rgba(0,0,0,0.5)",
          color: "white",
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
          fontSize: "0.875rem",
          zIndex: 10
        }}
      >
        {currentSlide + 1} / {slides.length}
      </Box>
    </Box>
  );
};

export default MainScreenContent;
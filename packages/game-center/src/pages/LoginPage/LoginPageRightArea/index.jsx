import { Box, useTheme, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm/LoginForm";

const LoginPageRightArea = () => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const backgroundGradient = isDarkMode
    ? "linear-gradient(135deg, #1a202c 0%, #1d2e4a 100%)"
    : "linear-gradient(135deg, #caecd5 0%, #65c5ab 100%)";
  
  const patternBg = isDarkMode
    ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)"
    : "repeating-linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px)";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: isMobile ? "100%" : "50%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundImage: backgroundGradient,
        boxShadow: isDarkMode 
          ? "0 0 25px rgba(0, 0, 0, 0.5)"
          : "-5px 0 25px rgba(0, 0, 0, 0.1)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? "translateX(0)" 
          : isMobile ? "translateY(50px)" : "translateX(50px)", 
        transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)", // Daha yumuşak ve etkileyici bir animasyon
        padding: { xs: 2, sm: 4 },
        borderRadius: isMobile ? 0 : "0 0 0 0", // Mobilde köşe yuvarlatma yok
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: patternBg,
          opacity: 0.3,
          zIndex: 1,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: isDarkMode 
            ? "radial-gradient(circle, rgba(45, 67, 104, 0.4) 0%, rgba(29, 46, 74, 0) 70%)"
            : "radial-gradient(circle, rgba(129, 199, 132, 0.4) 0%, rgba(101, 197, 171, 0) 70%)",
          filter: "blur(30px)",
          zIndex: 0,
        }
      }}
    >
      {/* LoginForm için konteyner - z-index ile öne çıkarılıyor */}
      <Box 
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "500px",
          animation: isVisible ? 
            "fadeIn 0.8s ease forwards 0.3s" : "none",
          opacity: 0, // Animation başlangıcında gizli
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 }
          }
        }}
      >
        <LoginForm />
      </Box>
      
      {/* Dekoratif alt daire */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: isDarkMode 
            ? "radial-gradient(circle, rgba(45, 67, 104, 0.3) 0%, rgba(29, 46, 74, 0) 70%)"
            : "radial-gradient(circle, rgba(129, 199, 132, 0.3) 0%, rgba(101, 197, 171, 0) 70%)",
          filter: "blur(25px)",
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default LoginPageRightArea;
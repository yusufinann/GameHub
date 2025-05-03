import { Box, useTheme, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm/LoginForm";

const LoginPageRightArea = () => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
        backgroundImage: theme.palette.background.gradientB,
        boxShadow: `0 0 25px ${theme.palette.background.elevation[2]}`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? "translateX(0)" 
          : isMobile ? "translateY(50px)" : "translateX(50px)", 
        transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        padding: { xs: 2, sm: 4 },
        borderRadius: isMobile ? 0 : "0 0 0 0",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: theme.palette.background.stripeBg,
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
          background: theme.palette.background.gradientFadeBg,
          filter: "blur(30px)",
          zIndex: 0,
        }
      }}
    >
      {/* LoginForm container with z-index to bring it forward */}
      <Box 
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "500px",
          animation: isVisible ? 
            "fadeIn 0.8s ease forwards 0.3s" : "none",
          opacity: 0, // Hidden at animation start
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 }
          }
        }}
      >
        <LoginForm />
      </Box>
      
      {/* Decorative bottom circle */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: theme.palette.background.gradientFadeBg,
          filter: "blur(25px)",
          zIndex: 0,
        }}
      />
    </Box>
  );
};

export default LoginPageRightArea;
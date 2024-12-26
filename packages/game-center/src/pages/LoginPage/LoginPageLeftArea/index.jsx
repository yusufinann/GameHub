import React, { useEffect, useState } from "react";
import LoginSrc from "./components/LoginSrc"; // Correct relative path
import { Box } from "@mui/material";

function LoginPageLeftArea() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Sayfa açıldığında animasyonu başlat
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "50%",
        height: "100%",
        opacity: isVisible ? 1 : 0, // Opaklık animasyonu
        transform: isVisible
          ? "rotateX(0deg)" // Bitiş: 0 derece, düzlemde
          : "rotateX(180deg)", // Başlangıç: 90 derece, düzlemden dışarı
        transition: "all 1s ease", // Geçiş süresi
        transformOrigin: "center", // Döndürme noktası merkez
      }}
    >
      <LoginSrc />
    </Box>
  );
}

export default LoginPageLeftArea;

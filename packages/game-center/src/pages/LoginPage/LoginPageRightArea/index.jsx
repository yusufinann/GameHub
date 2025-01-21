import { Box} from "@mui/material";
import React, { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";

const LoginPageRightArea = () => {
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
        backgroundImage: "linear-gradient(to bottom right, #a5f9be, #65c5ab)", // Linear gradient arka plan
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        opacity: isVisible ? 1 : 0, // Opaklık durumu
        transform: isVisible ? "translateX(0)" : "translateX(100px)", // Başlangıç ve bitiş noktası
        transition: "all 0.8s ease", // Geçiş efekti
      }}
    >
      <LoginForm />
    </Box>
  );
};

export default LoginPageRightArea;

import { useState, useEffect, useContext } from "react";
import { useTheme, alpha } from "@mui/material";
import { ThemeContext } from "../../theme/context";

const useSettingsPage = () => {
  const theme = useTheme();
  const { mode, toggle } = useContext(ThemeContext);
  const isDarkMode = mode === "dark";

  // States
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "tr";
  });
  
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem("soundEnabled") !== "false";
  });
  
  const [soundVolume, setSoundVolume] = useState(() => {
    return parseInt(localStorage.getItem("soundVolume") || "75");
  });
  
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  const handleThemeChange = () => {
    toggle();
    triggerSaveIndicator();
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    triggerSaveIndicator();
  };

  const handleSoundChange = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("soundEnabled", String(newValue));
    triggerSaveIndicator();
  };

  const handleVolumeChange = (event, newValue) => {
    setSoundVolume(newValue);
  };

  const handleVolumeChangeCommitted = () => {
    localStorage.setItem("soundVolume", String(soundVolume));
    triggerSaveIndicator();
  };

  const triggerSaveIndicator = () => {
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };

  const primary = theme.palette.primary;
  const secondary = theme.palette.secondary;

  const decorationGradient = isDarkMode
    ? `linear-gradient(135deg, ${alpha(primary.main, 0.4)} 0%, ${alpha(
        secondary.main,
        0.4
      )} 100%)`
    : `linear-gradient(135deg, ${alpha(primary.light, 0.5)} 0%, ${alpha(
        secondary.light,
        0.5
      )} 100%)`;

  return {
    theme,
    isDarkMode,
    handleThemeChange,
    language,
    handleLanguageChange,
    soundEnabled,
    soundVolume,
    handleSoundChange,
    handleVolumeChange,
    handleVolumeChangeCommitted,
    showSaveIndicator,
    animateCards,
    decorationGradient
  };
};

export default useSettingsPage;
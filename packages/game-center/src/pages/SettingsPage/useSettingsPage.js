import { useState, useEffect, useContext } from "react";
import { useTheme, alpha } from "@mui/material";
import { ThemeContext } from "../../theme/context";

const useSettingsPage = () => {
  const theme = useTheme();
  const { mode, setSpecificTheme } = useContext(ThemeContext);
  const isDarkMode = mode === "dark";
  const isNeonOceanMode = mode === "neonOcean";

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

  const handleThemeChange = (newTheme) => {
    
    if ((newTheme === 'light' && !isDarkMode && !isNeonOceanMode) ||
        (newTheme === 'dark' && isDarkMode) ||
        (newTheme === 'neonOcean' && isNeonOceanMode)) {
      console.log("Theme already set to", newTheme);
      return;
    }
    setSpecificTheme(newTheme);
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
  
  // Custom gradient for each theme
  let decorationGradient;
  if (isDarkMode) {
    decorationGradient = `linear-gradient(135deg, ${alpha(primary.main, 0.4)} 0%, ${alpha(
      secondary.main, 0.4)} 100%)`;
  } else if (isNeonOceanMode) {
    decorationGradient = `linear-gradient(135deg, ${alpha('#1a6b99', 0.4)} 0%, ${alpha(
      '#48b6df', 0.4)} 100%)`;
  } else {
    decorationGradient = `linear-gradient(135deg, ${alpha(primary.light, 0.5)} 0%, ${alpha(
      secondary.light, 0.5)} 100%)`;
  }

  return {
    theme,
    isDarkMode,
    isNeonOceanMode,
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
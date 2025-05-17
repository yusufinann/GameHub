import { useState, useEffect, useContext } from "react";
import { useTheme, alpha } from "@mui/material";
import { ThemeContext } from "../../theme/context"; // Assuming this path is correct
import { useTranslation } from 'react-i18next';
import { GameSettingsContext } from "../GameDetail/GameDetailRightArea/context";

const useSettingsPage = () => {
  const theme = useTheme();
  const { mode, setSpecificTheme } = useContext(ThemeContext);
  const {
    bingoSoundEnabled,
    toggleBingoSound,
    hangmanSoundEnabled,
    toggleHangmanSound,
  } = useContext(GameSettingsContext);
  const { i18n } = useTranslation();

  const isDarkMode = mode === "dark";
  const isNeonOceanMode = mode === "neonOcean";

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "tr";
  });

  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

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
    i18n.changeLanguage(lang);
    triggerSaveIndicator();
  };

  const triggerSaveIndicator = () => {
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };

  const primary = theme.palette.primary;
  const secondary = theme.palette.secondary;

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
    bingoSoundEnabled,
    toggleBingoSound,
    hangmanSoundEnabled,
    toggleHangmanSound,
    showSaveIndicator,
    triggerSaveIndicator, 
    animateCards,
    decorationGradient
  };
};

export default useSettingsPage;
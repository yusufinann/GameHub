import React, { useState, useContext } from "react";
import { Box, Popover, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { ThemeContext } from "../../../theme/context";
import { useTranslation } from "react-i18next";

const StyledFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: "10px 0",
  backgroundColor: theme.palette.background.card,
  borderTop: `1px solid ${theme.palette.primary.light}`,
}));

const StyledFooterItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.primary,
  margin: "5px 0px",
  padding: "8px",
  borderRadius: "50%",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    cursor: "pointer",
    transform: "translateY(-2px)"
  },
}));

const ThemeOption = styled(Box)(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 16px",
  margin: "8px",
  borderRadius: "12px",
  cursor: "pointer",
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
  border: active ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: "translateY(-2px)"
  }
}));

const ThemePreview = styled(Box)(({ theme, isDark, isNeonOcean }) => ({
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  marginRight: "12px",
  background: isDark
    ? "linear-gradient(to bottom, #1d2e4a, #0f1924)"
    : isNeonOcean
      ? "linear-gradient(to bottom, #48b6df, #1a6b99)"
      : "linear-gradient(to bottom, #caecd5, #fff)",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`
}));

const LanguageOption = styled(Box)(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 16px",
  margin: "8px",
  borderRadius: "12px",
  cursor: "pointer",
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
  border: active ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: "translateY(-2px)"
  }
}));

const LanguageFlag = styled(Box)(({ theme }) => ({
  width: "40px",
  height: "30px",
  borderRadius: "8px",
  marginRight: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`
}));

function SidebarFooter() {
  const theme = useTheme();
  const { mode, setSpecificTheme } = useContext(ThemeContext);
  const isDarkMode = mode === "dark";
  const isNeonOceanMode = mode === "neonOcean";
  const { t, i18n } = useTranslation();
  
  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const themeOpen = Boolean(themeAnchorEl);
  
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const langOpen = Boolean(langAnchorEl);
  
  const currentLanguage = i18n.language || "tr";

  const handleThemeClick = (event) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleThemeClose = () => {
    setThemeAnchorEl(null);
  };

  const handleLanguageClick = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLangAnchorEl(null);
  };

  const handleThemeChange = (newMode) => {
    setSpecificTheme(newMode);
    handleThemeClose();
  };
  
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    handleLanguageClose();
  };

  const bottomOptions = [
    { 
      name: "Language", 
      icon: <LanguageIcon />, 
      action: handleLanguageClick 
    },
    {
      name: "Theme",
      icon: <PaletteIcon />,
      action: handleThemeClick
    },
    { 
      name: "AI Magic", 
      icon: <AutoFixHighIcon />, 
      action: () => {} 
    },
  ];

  const themePopoverContent = (
    <Box sx={{
      p: 1,
      width: "280px",
      backgroundColor: theme.palette.background.card,
      borderRadius: "16px",
      boxShadow: `0 10px 25px ${alpha(theme.palette.common.black, 0.2)}`
    }}>
      <Typography
        variant="h6"
        sx={{
          p: 1,
          fontWeight: "bold",
          textAlign: "center",
          background: theme.palette.text.gradient,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {t('themeCard.title')}
      </Typography>

      <ThemeOption 
        active={!isDarkMode && !isNeonOceanMode} 
        onClick={() => handleThemeChange("light")}
      >
        <ThemePreview isDark={false} isNeonOcean={false} />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {t('themeCard.lightThemeAriaLabel')} 
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("Light View")}
          </Typography>
        </Box>
      </ThemeOption>
      
      <ThemeOption 
        active={isNeonOceanMode} 
        onClick={() => handleThemeChange("neonOcean")}
      >
        <ThemePreview isDark={false} isNeonOcean={true} />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {t('themeCard.neonOceanThemeAriaLabel')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("Neon and refreshing look")}
          </Typography>
        </Box>
      </ThemeOption>
      
      <ThemeOption 
        active={isDarkMode} 
        onClick={() => handleThemeChange("dark")}
      >
        <ThemePreview isDark={true} isNeonOcean={false} />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {t("themeCard.darkThemeAriaLabel")} 
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("Dark view")}
          </Typography>
        </Box>
      </ThemeOption>
    </Box>
  );
  
  const languagePopoverContent = (
    <Box sx={{
      p: 1,
      width: "280px",
      backgroundColor: theme.palette.background.card,
      borderRadius: "16px",
      boxShadow: `0 10px 25px ${alpha(theme.palette.common.black, 0.2)}`
    }}>
      <Typography
        variant="h6"
        sx={{
          p: 1,
          fontWeight: "bold",
          textAlign: "center",
          background: theme.palette.text.gradient,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {t('languageCard.title')}
      </Typography>

      <LanguageOption 
        active={currentLanguage.startsWith('tr')} 
        onClick={() => handleLanguageChange("tr")}
      >
        <LanguageFlag>🇹🇷</LanguageFlag>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {t('languageCard.turkish')} 
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Türkçe
          </Typography>
        </Box>
      </LanguageOption>
      
      <LanguageOption 
        active={currentLanguage.startsWith('en')} 
        onClick={() => handleLanguageChange("en")}
      >
        <LanguageFlag>🇺🇸</LanguageFlag>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {t('languageCard.english')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            English
          </Typography>
        </Box>
      </LanguageOption>
    </Box>
  );

  return (
    <StyledFooter>
      {bottomOptions.map((option) => (
        <StyledFooterItem 
          key={option.name}
          onClick={option.action}
          title={option.name}
        >
          {option.icon}
        </StyledFooterItem>
      ))}

      {/* Theme Popover */}
      <Popover
        open={themeOpen}
        anchorEl={themeAnchorEl}
        onClose={handleThemeClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          "& .MuiPopover-paper": { 
            borderRadius: "16px",
            overflow: "visible",
            mt: "-10px",
            "&:before": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: "10%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "16px",
              height: "16px",
              backgroundColor: theme.palette.background.card,
              zIndex: 0
            }
          }
        }}
      >
        {themePopoverContent}
      </Popover>
      
      {/* Language Popover */}
      <Popover
        open={langOpen}
        anchorEl={langAnchorEl}
        onClose={handleLanguageClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          "& .MuiPopover-paper": { 
            borderRadius: "16px",
            overflow: "visible",
            mt: "-10px",
            "&:before": {
              content: '""',
              position: "absolute",
              bottom: "-8px",
              left: "10%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "16px",
              height: "16px",
              backgroundColor: theme.palette.background.card,
              zIndex: 0
            }
          }
        }}
      >
        {languagePopoverContent}
      </Popover>
    </StyledFooter>
  );
}

export default SidebarFooter;
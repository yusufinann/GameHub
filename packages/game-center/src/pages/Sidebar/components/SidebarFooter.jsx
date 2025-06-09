import React, { useState, useContext, useRef } from "react";
import { Box, Popover, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import PaletteIcon from "@mui/icons-material/Palette";
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
  transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    cursor: "pointer",
  },
}));

const OptionItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  padding: "10px 16px",
  margin: "8px",
  borderRadius: "12px",
  cursor: "pointer",
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
  border: active ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  transition: "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }
}));

const PreviewBox = styled(Box)(({ theme }) => ({
  width: "40px",
  minHeight: "30px",
  height: "40px",
  borderRadius: "8px",
  marginRight: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.08)}`
}));

const ThemePreviewStyled = styled(PreviewBox, {
  shouldForwardProp: (prop) => prop !== 'isDark' && prop !== 'isNeonOcean'
})(({ theme, isDark, isNeonOcean }) => ({
  background: isDark
    ? "linear-gradient(to bottom, #1d2e4a, #0f1924)"
    : isNeonOcean
      ? "linear-gradient(to bottom, #48b6df, #1a6b99)"
      : "linear-gradient(to bottom, #caecd5, #fff)",
}));


function SidebarFooter() {
  const themeHook = useTheme();
  const { mode, setSpecificTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  const [themeAnchorEl, setThemeAnchorEl] = useState(null);
  const themeButtonRef = useRef(null);

  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const langButtonRef = useRef(null);

  const currentLanguage = i18n.language || "tr";

  const handleOpen = (event, setAnchorEl, buttonRef) => {
    buttonRef.current = event.currentTarget;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (setAnchorEl, buttonRef) => {
    setAnchorEl(null);
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  };

  const handleThemeChange = (newMode) => {
    setSpecificTheme(newMode);
    handleClose(setThemeAnchorEl, themeButtonRef);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    handleClose(setLangAnchorEl, langButtonRef);
  };

  const bottomOptions = [
    {
      name: t('sidebarFooter.language', "Language"),
      icon: <LanguageIcon />,
      action: (event) => handleOpen(event, setLangAnchorEl, langButtonRef),
      popoverId: 'language-popover',
    },
    {
      name: t('sidebarFooter.theme', "Theme"),
      icon: <PaletteIcon />,
      action: (event) => handleOpen(event, setThemeAnchorEl, themeButtonRef),
      popoverId: 'theme-popover',
    }
  ];

  const popoverPaperSlotProps = {
    elevation: 3,
    sx: {
      borderRadius: "12px",
      marginTop: "4px",
    }
  };

  const popoverContentSx = {
    p: 1,
    width: "250px",
    backgroundColor: themeHook.palette.background.card,
    borderRadius: "inherit",
  };

  const popoverTitleSx = {
    p: 1,
    fontWeight: "bold",
    textAlign: "center",
    mb: 1,
    color: themeHook.palette.text.primary,
  };


  const themePopoverContent = (
    <Box sx={popoverContentSx}>
      <Typography variant="h6" sx={popoverTitleSx}>
        {t('themeCard.title')}
      </Typography>
      <OptionItem active={mode === "light"} onClick={() => handleThemeChange("light")}>
        <ThemePreviewStyled isDark={false} isNeonOcean={false} />
        <Box>
          <Typography variant="body1" fontWeight="medium">{t('themeCard.lightThemeAriaLabel')}</Typography>
          <Typography variant="caption" color="text.secondary">{t("Light View")}</Typography>
        </Box>
      </OptionItem>
      <OptionItem active={mode === "neonOcean"} onClick={() => handleThemeChange("neonOcean")}>
        <ThemePreviewStyled isDark={false} isNeonOcean={true} />
        <Box>
          <Typography variant="body1" fontWeight="medium">{t('themeCard.neonOceanThemeAriaLabel')}</Typography>
          <Typography variant="caption" color="text.secondary">{t("Neon and refreshing look")}</Typography>
        </Box>
      </OptionItem>
      <OptionItem active={mode === "dark"} onClick={() => handleThemeChange("dark")}>
        <ThemePreviewStyled isDark={true} isNeonOcean={false} />
        <Box>
          <Typography variant="body1" fontWeight="medium">{t("themeCard.darkThemeAriaLabel")}</Typography>
          <Typography variant="caption" color="text.secondary">{t("Dark view")}</Typography>
        </Box>
      </OptionItem>
    </Box>
  );

  const languagePopoverContent = (
    <Box sx={popoverContentSx}>
      <Typography variant="h6" sx={popoverTitleSx}>
        {t('languageCard.title')}
      </Typography>
      <OptionItem active={currentLanguage.startsWith('tr')} onClick={() => handleLanguageChange("tr")}>
        <PreviewBox as="span">🇹🇷</PreviewBox>
        <Box>
          <Typography variant="body1" fontWeight="medium">{t('languageCard.turkish')}</Typography>
          <Typography variant="caption" color="text.secondary">Türkçe</Typography>
        </Box>
      </OptionItem>
      <OptionItem active={currentLanguage.startsWith('en')} onClick={() => handleLanguageChange("en")}>
        <PreviewBox as="span">🇺🇸</PreviewBox>
        <Box>
          <Typography variant="body1" fontWeight="medium">{t('languageCard.english')}</Typography>
          <Typography variant="caption" color="text.secondary">English</Typography>
        </Box>
      </OptionItem>
    </Box>
  );

  return (
    <StyledFooter>
      {bottomOptions.map((option) => (
        <StyledFooterItem
          key={option.name}
          onClick={option.action}
          title={option.name}
          aria-label={option.name}
          aria-haspopup={!!option.popoverId}
          aria-controls={option.popoverId || undefined}
          ref={option.popoverId === 'theme-popover' ? themeButtonRef : option.popoverId === 'language-popover' ? langButtonRef : null}
        >
          {option.icon}
        </StyledFooterItem>
      ))}

      <Popover
        id="theme-popover"
        open={Boolean(themeAnchorEl)}
        anchorEl={themeAnchorEl}
        onClose={() => handleClose(setThemeAnchorEl, themeButtonRef)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: popoverPaperSlotProps
        }}
      >
        {themePopoverContent}
      </Popover>

      <Popover
        id="language-popover"
        open={Boolean(langAnchorEl)}
        anchorEl={langAnchorEl}
        onClose={() => handleClose(setLangAnchorEl, langButtonRef)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: popoverPaperSlotProps
        }}
      >
        {languagePopoverContent}
      </Popover>
    </StyledFooter>
  );
}

export default SidebarFooter;
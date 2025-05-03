import React, { useState, useContext } from "react";
import { Box, Popover, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { ThemeContext } from "../../../theme/context";

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
  border: active ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
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

function SidebarFooter() {
  const theme = useTheme();
  const { mode, setSpecificTheme } = useContext(ThemeContext);
  const isDarkMode = mode === "dark";
  const isNeonOceanMode = mode === "neonOcean";
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleThemeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode) => {
    setSpecificTheme(newMode);
    handleClose();
  };

  const bottomOptions = [
    { name: "Language", icon: <LanguageIcon />, action: () => {} },
    { 
      name: "Theme", 
      icon: <PaletteIcon />, 
      action: handleThemeClick 
    },
    { name: "AI Magic", icon: <AutoFixHighIcon />, action: () => {} },
  ];

  // Tema popover'ının içeriği
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
        Choose Theme
      </Typography>
      
      <ThemeOption 
        active={!isDarkMode && !isNeonOceanMode} 
        onClick={() => handleThemeChange("light")}
      >
        <ThemePreview isDark={false} isNeonOcean={false} />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Light 
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Light View
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
            Neon Ocean 
          </Typography>
          <Typography variant="body2" color="text.secondary">
          Neon and refreshing look
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
            Dark 
          </Typography>
          <Typography variant="body2" color="text.secondary">
          Dark view
          </Typography>
        </Box>
      </ThemeOption>
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
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
    </StyledFooter>
  );
}

export default SidebarFooter;
import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

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
  transition: "color 0.2s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.dark,
    cursor: "pointer"
  },
}));

function SidebarFooter() {
  const bottomOptions = [
    { name: "Language", icon: <LanguageIcon /> },
    { name: "Theme", icon: <PaletteIcon /> },
    { name: "AI Magic", icon: <AutoFixHighIcon /> },
  ];

  return (
    <StyledFooter>
      {bottomOptions.map((option) => (
        <StyledFooterItem key={option.name}>
          {option.icon}
        </StyledFooterItem>
      ))}
    </StyledFooter>
  );
}

export default SidebarFooter;
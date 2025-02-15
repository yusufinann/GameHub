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
  backgroundColor: "rgb(165, 249, 190)",
  borderTop: "1px solid #d5fdcd",
}));

const StyledFooterItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "black",
  margin: "5px 0px",
  "&:hover": {
    color: "#269366",
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
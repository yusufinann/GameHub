import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import LanguageIcon from "@mui/icons-material/Language";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const StyledFooter = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})(({ theme, isExpanded }) => ({
  display: "flex",
  flexDirection: isExpanded ? "row" : "column",
  justifyContent: isExpanded ? "space-around" : "center",
  alignItems: "center",
  position: "absolute", // Ensures the footer is fixed at the bottom 
  bottom: 0,
  left: 0,
  right: 0,
  height: isExpanded ? "10vh" : "auto",
  padding: isExpanded ? "0" : "10px 0",
  backgroundColor: "rgb(165, 249, 190)",
  borderTop: "1px solid #d5fdcd",
  [theme.breakpoints.down("md")]: {
    height: isExpanded ? "8vh" : "auto",
  },
}));


const StyledFooterItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "black",
  margin: "5px 0px",
  "&:hover": {
    color: "#269366",
  },
}));

const StyledFooterIcon = styled(Box)(({ theme }) => ({
  marginBottom: "5px",
  fontSize: "1.5rem",
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.2rem",
  },
}));

const StyledFooterText = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  [theme.breakpoints.up('sm')]: {
    padding: '2px',
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.55rem",
  },
}));

function SidebarFooter({ isExpanded }) {
  const bottomOptions = [
    { name: "Language", icon: <LanguageIcon /> },
    { name: "Theme", icon: <PaletteIcon /> },
    { name: "AI Magic", icon: <AutoFixHighIcon /> },
  ];

  return (
    <StyledFooter isExpanded={isExpanded}>
      {bottomOptions.map((option) => (
        <StyledFooterItem key={option.name}>
          <StyledFooterIcon>{option.icon}</StyledFooterIcon>
          {isExpanded && <StyledFooterText>{option.name}</StyledFooterText>}
        </StyledFooterItem>
      ))}
    </StyledFooter>
  );
}

export default SidebarFooter;
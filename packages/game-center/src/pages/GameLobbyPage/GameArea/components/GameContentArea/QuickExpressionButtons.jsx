import React, { useState } from "react";
import { Box, Button, IconButton, useMediaQuery } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

const predefinedExpressions = [
  "👍", "😂", "❤️", "🎉", "😮", "👏", "💯", "🤔", "🙏", "🔥", "🤝", "🤩",
];

const QuickEmojiButton = styled(Button)(({ theme, size }) => ({
  minWidth: "auto",
  width: size === "small" ? "40px" : "50px", 
  height: size === "small" ? "40px" : "50px", 
  fontSize: size === "small" ? "20px" : "24px",
  borderRadius: "12px", 
  padding: 0,
  margin: '0 2px',
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "2px solid",
  borderColor: theme.palette.primary.light, 
  color: theme.palette.primary.main, 
  transition: "all 0.3s ease-in-out", 
  "&:hover": {
    backgroundColor: theme.palette.secondary.main, 
    color: theme.palette.common.white,
    boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.3)}`,
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
}));

const CollapsibleHandle = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: -32,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: alpha(theme.palette.primary.main, 0.95), 
  padding: "2px 16px", 
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 -4px 12px ${alpha(theme.palette.common.black, 0.2)}`, 
  transition: "all 0.3s ease",
  '&:hover': {
    paddingTop: 4,
    backgroundColor: theme.palette.primary.main, 
  },
}));

const EmojiIcon = styled(EmojiEmotionsIcon)(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: "1.8rem",
  filter: "drop-shadow(0 0 3px rgba(255,255,255,0.7))",
}));

const QuickExpressionButtons = ({ onSendExpression }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [isExpanded, setIsExpanded] = useState(false);

  const displayCount = isMobile ? 6 : isTablet ? 8 : predefinedExpressions.length;
  const buttonSize = isMobile ? "small" : "medium";
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: isExpanded ? 0 : -72,
        left: 0,
        right: 0,
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "nowrap",
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: "blur(10px)",
        py: 1.5, 
        px: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        zIndex: 10,
        boxShadow: `0 -4px 10px ${alpha(theme.palette.common.black, 0.1)}`,
        transition: "bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "&:hover": {
          bottom: 0,
        }
      }}
    >
      <CollapsibleHandle onClick={handleToggleExpand}>
        <IconButton 
          size="medium" 
          sx={{ 
            color: theme.palette.common.white,
            p: 0.8,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease"
          }}
        >
          {isExpanded ? (
            <KeyboardArrowUpIcon fontSize="medium" />
          ) : (
            <EmojiIcon /> 
          )}
        </IconButton>
      </CollapsibleHandle>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          gap: 0.5,
          maxWidth: "100%",
          pb: 0.5,
          "::-webkit-scrollbar": {
            height: "6px",
          },
          "::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.05)",
            borderRadius: "12px", 
          },
          "::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.primary.main, 0.5), 
            borderRadius: "12px", 
            "&:hover": {
              background: alpha(theme.palette.primary.main, 0.7), 
            },
          }
        }}
      >
        {predefinedExpressions.slice(0, displayCount).map((emoji, index) => (
          <QuickEmojiButton
            key={index}
            onClick={() => {
              onSendExpression(emoji);
            }}
            variant="outlined"
            size={buttonSize}
          >
            {emoji}
          </QuickEmojiButton>
        ))}
      </Box>
    </Box>
  );
};

export default QuickExpressionButtons;
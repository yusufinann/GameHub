import React from "react";
import { Box, Button } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";


const predefinedExpressions = [
  "👍", "😂", "❤️", "🎉", "😮", "👏", "💯", "🤔", "🙏", "🔥", "🤝", "🤩",
];


const QuickEmojiButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  width: "50px", 
  height: "50px", 
  fontSize: "24px",
  borderRadius: "15px", 
  p: 0,
  mx: 0.5, 
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
  },
}));

const QuickExpressionButtons = ({ onSendExpression }) => {
  const theme = useTheme(); 

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mb:0,
        gap: 0.5,
        overflowX: "auto",
        px: 1,
        pb: 1,
        "::-webkit-scrollbar": {
          height: "8px",
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
      {predefinedExpressions.map((emoji, index) => (
        <QuickEmojiButton
          key={index}
          onClick={() => onSendExpression(emoji)}
          variant="outlined" 
        >
          {emoji}
        </QuickEmojiButton>
      ))}
    </Box>
  );
};

export default QuickExpressionButtons;
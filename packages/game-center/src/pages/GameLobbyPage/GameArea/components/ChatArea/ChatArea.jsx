import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import ExpressionHistory from "./ExpressionHistory";
import ExpressionPanel from "./ExpressionPanel";

const ChatArea = ({ expressions, onSendExpression, isChatOpen }) => {
  const theme = useTheme();
  
  if (!isChatOpen) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        width: "100%",
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${theme.palette.background.elevation[1]}`,
        transition: 'width 0.3s ease-in-out',
        opacity: 1,
      }}
    >
      <Box 
        sx={{ 
          p: 1, 
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Chat
        </Typography>
      </Box>
      
      {/* Expression History */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          background: theme.palette.background.gradient,
          boxShadow: `0 4px 12px ${theme.palette.background.elevation[2]}`,
          border: `1px solid ${theme.palette.background.elevation[1]}`,
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden'
        }}
      >
        <ExpressionHistory expressions={expressions} />
        <ExpressionPanel.Input onSendExpression={onSendExpression} />
      </Box>
    </Box>
  );
};

export default ChatArea;
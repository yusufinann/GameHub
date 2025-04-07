import React from "react";
import { Box, Typography } from "@mui/material";
import ExpressionHistory from "./ExpressionHistory";
import ExpressionPanel from "./ExpressionPanel";

const ChatArea = ({ expressions, onSendExpression, isChatOpen }) => {
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
        borderLeft: '1px solid rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease-in-out',
        opacity: 1,
      }}
    >
      <Box 
        sx={{ 
          p: 1, 
          background: "linear-gradient(to right, #328761, #4CAF50)",
          color: 'white',
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
          background: "linear-gradient(to bottom, #b2ebf2, white)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: '1px solid rgba(0,0,0,0.1)',
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
import React, { useRef, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  Typography,
  Avatar,
  keyframes,
} from "@mui/material";

const fadeInSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ExpressionHistory = ({ expressions }) => {
  const expressionsListRef = useRef(null);

  useEffect(() => {
    if (expressionsListRef.current) {
      expressionsListRef.current.scrollTop = expressionsListRef.current.scrollHeight;
    }
  }, [expressions]);
  return (
    <Box
      ref={expressionsListRef}
      sx={{
        height: '70vh',
        width:'100%', 
        overflowY: "auto",
        borderTop: "1px solid rgba(26, 35, 126, 0.2)",
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(240, 240, 255, 0.6))",
        "::-webkit-scrollbar": {
          width: "6px",
        },
        "::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.05)",
          borderRadius: "10px",
        },
        "::-webkit-scrollbar-thumb": {
          background: "rgba(26, 35, 126, 0.3)",
          borderRadius: "10px",
          "&:hover": {
            background: "rgba(26, 35, 126, 0.5)",
          },
        }
      }}
    >
      <List>
        {expressions.map((expr, index) => (
          <ListItem
            key={index}
            alignItems="flex-start"
            sx={{
              transition: "background-color 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.03)",
              },
              animation: `${fadeInSlideUp} 0.3s ease-out`,
              animationDelay: `${Math.min(index, 5) * 0.05}s`,
            }}
          >
            <Box sx={{ display: "flex", width: "100%" }}>
              <Avatar

              src={expr.senderAvatar || undefined}
                sx={{
                  mr: 1,
                  bgcolor: "primary.main",
                  width: 36,
                  height: 36,
                }}
              >
                { !expr.avatar ? expr.senderName.charAt(0).toUpperCase() : null }
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                    {expr.senderName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    @{expr.senderUsername}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                    fontSize: expr.expression.length < 3 ? "1.5rem" : "0.9rem",
                  }}
                >
                  {expr.expression}
                </Typography>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ExpressionHistory;
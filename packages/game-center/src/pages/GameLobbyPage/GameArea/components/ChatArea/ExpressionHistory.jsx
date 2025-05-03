import React, { useRef, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  Typography,
  Avatar,
  keyframes,
  useTheme,
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
  const theme = useTheme();

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
        width: '100%', 
        overflowY: "auto",
        borderTop: `1px solid ${theme.palette.background.elevation[1]}`,
        background: theme.palette.background.gradientB,
        "::-webkit-scrollbar": {
          width: "6px",
        },
        "::-webkit-scrollbar-track": {
          background: theme.palette.background.elevation[1],
          borderRadius: "10px",
        },
        "::-webkit-scrollbar-thumb": {
          background: theme.palette.primary.light,
          borderRadius: "10px",
          "&:hover": {
            background: theme.palette.primary.medium || theme.palette.primary.main,
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
                backgroundColor: theme.palette.background.elevation[1],
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
                  bgcolor: theme.palette.primary.main,
                  width: 36,
                  height: 36,
                  color: theme.palette.primary.text,
                }}
              >
                {!expr.avatar ? expr.senderName.charAt(0).toUpperCase() : null}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="bold" 
                    color="primary.main"
                    sx={{
                      background: theme.palette.info.main,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {expr.senderName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    @{expr.senderUsername}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  color="text.primary"
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
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { BingoGame } from "@gamecenter/bingo-game";
import { Hangman } from "@gamecenter/hangman-game";
import ExpressionPanel from "../ChatArea/ExpressionPanel";
import QuickExpressionButtons from "./QuickExpressionButtons";

const GameContentArea = ({ 
  lobbyInfo, 
  currentUser, 
  socket, 
  members, 
  soundEnabled, 
  toggleSound, 
  soundEnabledRef, 
  centerExpressions, 
  onSendExpression,
  isChatOpen
}) => {
  const theme = useTheme();
  
  // Helper function to render the game content based on lobbyInfo.game
  const renderGameContent = () => {
    switch(lobbyInfo.game) {
      case "1":
        return (
          <Box sx={{ height: '70vh' }}>
            <BingoGame
              sx={{
                width: "100%",
                height: "100%",
                "& .MuiContainer-root": {
                  height: "100%",
                  maxWidth: "none",
                  p: 0,
                },
                "& .MuiCard-root": {
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: `0 12px 32px ${theme.palette.background.elevation[2]}`,
                  border: `1px solid ${theme.palette.background.offwhite}`,
                  background: `${theme.palette.background.paper}B3`, // B3 = 70% opacity
                  backdropFilter: 'blur(8px)',
                },
                "& .MuiCardContent-root": {
                  flex: 1,
                  overflow: "auto",
                  p: 3,
                },
              }}
              lobbyCode={lobbyInfo.lobbyCode}
              socket={socket}
              currentUser={currentUser}
              lobbyInfo={lobbyInfo}
              members={members}
              soundEnabled={soundEnabled} 
              toggleSound={toggleSound} 
              soundEnabledRef={soundEnabledRef}
            />
          </Box>
        );
      case "4":
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              borderRadius: "24px",
              background: `${theme.palette.background.paper}B3`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 12px 32px ${theme.palette.background.elevation[2]}`,
              border: `1px solid ${theme.palette.background.offwhite}`,
            }}
          >
            <Hangman lobbyCode={lobbyInfo.lobbyCode} lobbyInfo={lobbyInfo} members={members} socket={socket} user={currentUser}/>
          </Box>
        );
      default:
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              borderRadius: "24px",
              background: `${theme.palette.background.paper}B3`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 12px 32px ${theme.palette.background.elevation[2]}`,
              border: `1px solid ${theme.palette.background.offwhite}`,
            }}
          >
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 'bold', 
                textShadow: `1px 1px 2px ${theme.palette.background.elevation[1]}` 
              }}
            >
              Other Games
            </Typography>
          </Box>
        );
    }
  };
  
  return (
    <Box 
      sx={{ 
        width: isChatOpen ? "70%" : "100%", 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
        pr: isChatOpen ? 1 : 0
      }}
    >
      {/* Center Screen Expression Area */}
      <ExpressionPanel centerExpressions={centerExpressions} />
      
      {/* Game Content Area */}
      {renderGameContent()}
      
      {/* Quick Expression Buttons */}
      <QuickExpressionButtons onSendExpression={onSendExpression} />
    </Box>
  );
};

export default GameContentArea;
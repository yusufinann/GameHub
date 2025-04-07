import React from "react";
import { Box, Typography } from "@mui/material";
import { BingoGame } from "@gamecenter/bingo-game";
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

      {/* Bingo Game */}
      {lobbyInfo.game === "1" ? (
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
                boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.7)',
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
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            borderRadius: "24px",
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
            Diğer Oyun İçeriği Burada
          </Typography>
        </Box>
      )}
      {/* Quick Expression Buttons */}
      <QuickExpressionButtons onSendExpression={onSendExpression} />
    </Box>
  );
};

export default GameContentArea;
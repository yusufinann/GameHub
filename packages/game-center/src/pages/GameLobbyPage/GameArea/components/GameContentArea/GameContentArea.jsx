import React, { useContext } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { BingoGame } from "@gamecenter/bingo-game";
import { Hangman } from "@gamecenter/hangman-game";
import ExpressionPanel from "../ChatArea/ExpressionPanel";
import QuickExpressionButtons from "./QuickExpressionButtons";
import { GameSettingsContext } from "../../../../GameDetail/GameDetailRightArea/context";

const GameContentArea = ({
  lobbyInfo,
  currentUser,
  socket,
  members,
  centerExpressions,
  onSendExpression,
  isChatOpen,
  t
}) => {
  const theme = useTheme();
  const {
    bingoSoundEnabled,
    toggleBingoSound, 
    bingoSoundEnabledRef,
    hangmanSoundEnabled,
    toggleHangmanSound
  } = useContext(GameSettingsContext);

  const renderGameContent = () => {
    switch (lobbyInfo.game) {
      case "1": // Bingo
        return (
          <Box sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pb: { xs: 3, sm: 3 }
          }}>
            <BingoGame
              lobbyCode={lobbyInfo.lobbyCode}
              socket={socket}
              currentUser={currentUser}
              lobbyInfo={lobbyInfo}
              members={members}
              soundEnabled={bingoSoundEnabled} 
              toggleSound={toggleBingoSound}   
              soundEnabledRef={bingoSoundEnabledRef} 
              t={t}
            />
          </Box>
        );
      case "2": // Hangman
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              borderRadius: "24px",
              
            }}
          >
            <Hangman
              lobbyCode={lobbyInfo.lobbyCode}
              lobbyInfo={lobbyInfo}
              members={members}
              socket={socket}
              user={currentUser}
              toggleSound={toggleHangmanSound}
              hangmanSoundEnabled={hangmanSoundEnabled} 
              t={t}
            />
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
              pb: { xs: 3, sm: 3 }
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
        pr: isChatOpen ? 1 : 0,
        position: 'relative', 
      }}
    >
      <ExpressionPanel centerExpressions={centerExpressions} />
      {renderGameContent()}
      <QuickExpressionButtons onSendExpression={onSendExpression} />
    </Box>
  );
};

export default GameContentArea;
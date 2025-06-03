import React, { useContext } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { BingoGame } from "@gamecenter/bingo-game";
import { Hangman } from "@gamecenter/hangman-game";
import ExpressionPanel from "./ChatArea/ExpressionPanel";
import { GameSettingsContext } from "../../../GameDetail/GameDetailRightArea/context";

const GameContentArea = ({
  lobbyInfo,
  currentUser,
  socket,
  isConnected,
  members,
  centerExpressions,
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
    if (!lobbyInfo) { 
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <Typography>{t("LoadingGameInfo")}</Typography>
            </Box>
        );
    }
    switch (lobbyInfo.game) {
      case "1": // Bingo
        return (
          <Box sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1, 
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
               isConnected={isConnected} 
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
              isConnected={isConnected}
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
              {t("Other Games")}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1, 
        width: isChatOpen ? "calc(100% - 30% - 64px)" : "calc(100% - 64px)", 
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden', 
        position: 'relative', 
        height: '100%'
      }}
    >
      <ExpressionPanel centerExpressions={centerExpressions} />
      {renderGameContent()}
    </Box>
  );
};

export default GameContentArea;
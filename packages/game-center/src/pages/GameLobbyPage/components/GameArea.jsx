import React, { useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ExitToApp as ExitIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  Message as MessageIcon,
  KeyboardArrowLeft as CollapseIcon,
} from "@mui/icons-material";
import { BingoGame } from "@gamecenter/bingo-game";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
import { v4 as uuidv4 } from "uuid";
import ExpressionPanel from "./ExpressionPanel";
import QuickExpressionButtons from "./QuickExpressionButtons";
import ExpressionHistory from "./ExpressionHistory";
import { useEffect, useState } from "react";
import { GameSettingsContext} from "../../GameDetail/GameDetailRightArea/context";

const GameArea = ({ lobbyInfo, members, isHost, onDelete, onLeave, isDeletingLobby, isLeavingLobby }) => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const [expressions, setExpressions] = useState([]);
  const [centerExpressions, setCenterExpressions] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(true);

  useEffect(() => {
    if (socket && lobbyInfo) {
      const messageHandler = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "RECEIVE_EXPRESSION") {
          setExpressions((prevExpressions) => [...prevExpressions, message.data]);
          displayCenterExpression(message.data);
        } else if (message.type === "CHAT_HISTORY") {
          if (message.lobbyCode === lobbyInfo.lobbyCode) {
            setExpressions(message.history);
          }
        }
      };

      socket.addEventListener("message", messageHandler);

      const fetchChatHistory = () => {
        if (socket && lobbyInfo) {
          socket.send(JSON.stringify({
            type: "GET_CHAT_HISTORY",
            lobbyCode: lobbyInfo.lobbyCode,
          }));
        }
      };
      fetchChatHistory();

      return () => {
        socket.removeEventListener("message", messageHandler);
      };
    }
  }, [socket, setExpressions, lobbyInfo]);

  const handleSendExpression = (expression) => {
    if (expression.trim()) {
      const messagePayload = {
        type: "SEND_EXPRESSION",
        lobbyCode: lobbyInfo.lobbyCode,
        expression: expression,
        senderName: currentUser.name,
        senderUsername: currentUser.username,
        senderId: currentUser.id,
        senderAvatar: currentUser.avatar,
      };
      socket.send(JSON.stringify(messagePayload));
    }
  };

  const displayCenterExpression = (expressionData) => {
    const expressionId = uuidv4();
    const animationtype = expressionData.animationtype;

    setCenterExpressions((prevExpressions) => [
      ...prevExpressions,
      { ...expressionData, id: expressionId, animationtype },
    ]);

    setTimeout(() => {
      setCenterExpressions((prevExpressions) =>
        prevExpressions.filter((expr) => expr.id !== expressionId)
      );
    }, 3000);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  const { soundEnabled, toggleSound, soundEnabledRef } =
    useContext(GameSettingsContext); // Context'i tüketiyoruz
  return (
    <Paper
      elevation={12}
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        p: 1,
        background: "rgba(202, 236, 213, 0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
        border: '2px solid rgba(255, 255, 255, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: 'url("https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.25,
          zIndex: -1,
          filter: 'brightness(1.05) contrast(1.1)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(114, 203, 163, 0.1))',
          zIndex: -1,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(90deg, #328761, #4CAF50)",
          color: "white",
          boxShadow: "0 6px 24px rgba(50, 135, 97, 0.4)",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "white",
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          <GameIcon fontSize="large" />
          {lobbyInfo.lobbyName}
          <Typography
            variant="h5"
            sx={{
              color: "#b2ebf2",
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontWeight: "bold",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            <StarsIcon fontSize="large" />
            {lobbyInfo.game === "1" ? "Bingo Oyunu" : "Diğer Oyun"}
          </Typography>
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {isHost && (
            <Button
              variant="contained"
              color="error"
              onClick={onDelete}
              startIcon={<ExitIcon />}
              disabled={isDeletingLobby}
              sx={{
                borderRadius: "16px",
                textTransform: "none",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
                fontWeight: "bold",
                px: 3.5,
                py: 1.5,
                backgroundColor: "#f44336",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
            >
              {isDeletingLobby ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : 'Delete Lobby'}
            </Button>
          )}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ExitIcon />}
            disabled={isLeavingLobby}
            sx={{
              borderRadius: "16px",
              textTransform: "none",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              "&:hover": {
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                transform: "translateY(-2px)",
                backgroundColor: "rgba(255,255,255,0.15)",
              },
              transition: "all 0.3s ease",
              fontWeight: "bold",
              border: "2px solid white",
              px: 3.5,
              py: 1.5,
              fontSize: '1rem',
            }}
            onClick={onLeave}
          >
            {isLeavingLobby ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : 'Leave Lobby'}
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          p: 1,
          position: "relative",
        }}
      >
        {/* Game Area - Left Side */}
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
                soundEnabled={soundEnabled} toggleSound={toggleSound} soundEnabledRef={soundEnabledRef}
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
          <QuickExpressionButtons onSendExpression={handleSendExpression} />
        </Box>

        {/* Chat Toggle Button*/}
        <Box 
          sx={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            zIndex: 5
          }}
        >
          <IconButton
            onClick={toggleChat}
            aria-label={isChatOpen ? "Sohbeti Gizle" : "Sohbeti Göster"}
            sx={{
              borderRadius: "50%",
              background: isChatOpen
                ? "linear-gradient(135deg, #328761, #4CAF50)"
                : "linear-gradient(135deg, #b2ebf2, #80deea)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
              "&:hover": {
                boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                transform: "translateY(-3px) scale(1.05)",
                filter: "brightness(1.2)",
              },
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              width: 40,
              height: 40,
              border: "2px solid white",
              p: 0.5,
            }}
          >
            {isChatOpen ? <CollapseIcon /> : <MessageIcon />}
          </IconButton>
        </Box>

        {/* Chat Area - Right Side (Slidable) */}
        <Box 
          sx={{ 
            width: isChatOpen ? "30%" : "0%",
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: isChatOpen ? '1px solid rgba(0,0,0,0.1)' : 'none',
            transition: 'width 0.3s ease-in-out',
            ml: isChatOpen ? 2 : 0,
            opacity: isChatOpen ? 1 : 0,
          }}
        >
          {isChatOpen && (
            <>
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
                <ExpressionPanel.Input onSendExpression={handleSendExpression} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default GameArea;
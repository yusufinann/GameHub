import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Paper,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  KeyboardArrowLeft as CollapseIcon,
  Message as MessageIcon,
  VisibilityOff as HideExpressionsIcon,
  Visibility as ShowExpressionsIcon,
} from "@mui/icons-material";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
import { v4 as uuidv4 } from "uuid";
import { GameSettingsContext } from "../../GameDetail/GameDetailRightArea/context";
import GameAreaHeader from "./components/GameAreaHeader/GameAreaHeader";
import GameContentArea from "./components/GameContentArea";
import ChatArea from "./components/ChatArea/ChatArea";
import QuickExpressionButtons from "./components/QuickExpressionButtons";

const SHOW_EXPRESSIONS_KEY = "showExpressions";

const GameArea = ({ lobbyInfo, members, isHost, onDelete, onLeave, isDeletingLobby, isLeavingLobby,t}) => {
  const { currentUser } = useAuthContext();
  const { socket,isConnected } = useWebSocket();
  const [expressions, setExpressions] = useState([]);
  const [centerExpressions, setCenterExpressions] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const theme = useTheme();
  
  const [showExpressions, setShowExpressions] = useState(() => {
    try {
      const savedValue = localStorage.getItem(SHOW_EXPRESSIONS_KEY);
      return savedValue === null ? true : JSON.parse(savedValue);
    } catch (error)
      { // console.error("LocalStorage okuma hatası:", error); 
      return true; 
    }
  });
  
  const { soundEnabled, toggleSound, soundEnabledRef } = useContext(GameSettingsContext);
  useEffect(() => {
    try {
      localStorage.setItem(SHOW_EXPRESSIONS_KEY, JSON.stringify(showExpressions));
    } catch (error) {
      // console.error("LocalStorage yazma hatası:", error); 
    }
  }, [showExpressions]);

  useEffect(() => {
    if (socket && lobbyInfo) {
      const messageHandler = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "RECEIVE_EXPRESSION") {
          setExpressions((prevExpressions) => [...prevExpressions, message.data]);
          if (showExpressions) {
            displayCenterExpression(message.data);
          }
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
  }, [socket, setExpressions, lobbyInfo, showExpressions]);

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

  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
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

  const toggleExpressions = debounce(() => {
    setShowExpressions((prev) => {
      const newValue = !prev;
      if (!newValue) {
        setCenterExpressions([]);
      }
      return newValue;
    });
  }, 200);

  const getBackgroundImageUrl = (gameId) => {
    const numericGameId = Number(gameId);
    switch (numericGameId) {
      case 1:
        return "https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg";
      case 2:
        return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ63bZ9-d9KLHmXM7kXcxhBTIG--ZPlT64tcQ&s";
      case 3:
        return "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Funo%2Fhome%2FGameName_Store_Landscape_2560x1440-2560x1440-5195e8a3e06d672f97a1ee49ecea59027c14cae4.jpg";
      case 4:
        return "https://www.shutterstock.com/shutterstock/photos/1258437028/display_1500/stock-photo-logic-chess-game-logo-simple-illustration-of-logic-chess-game-logo-for-web-design-isolated-on-1258437028.jpg";
      default:
        return "https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg"; 
    }
  };

  const backgroundImageUrl = lobbyInfo ? getBackgroundImageUrl(lobbyInfo.game) : getBackgroundImageUrl(undefined);

  return (
    <Paper
      elevation={12}
      sx={{
        height: "100%",
        width: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(12px)",
        borderTopRightRadius:'24px', 
        borderBottomRightRadius:'24px',
        overflow: "hidden", 
        position: "relative",
        border: `2px solid ${theme.palette.background.elevation[1]}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
         backgroundImage: `url("${backgroundImageUrl}")`,
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
          background: theme.palette.background.gradientFadeBg,
          zIndex: -1,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header Component */}
      <GameAreaHeader
        lobbyInfo={lobbyInfo}
        isHost={isHost}
        onDelete={onDelete}
        onLeave={onLeave}
        isDeletingLobby={isDeletingLobby}
        isLeavingLobby={isLeavingLobby}
        t={t}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden", 
          position: "relative", 
          flexDirection: "column",
        }}
      >
        {/* Game and Chat Container */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden"}}>
          <GameContentArea
            lobbyInfo={lobbyInfo}
            currentUser={currentUser}
            socket={socket}
            isConnected={isConnected}
            members={members}
            soundEnabled={soundEnabled} 
            toggleSound={toggleSound}
            soundEnabledRef={soundEnabledRef} 
            centerExpressions={showExpressions ? centerExpressions : []}
            isChatOpen={isChatOpen}
            t={t}
          />

          {/* Control Buttons */}
          <Box
            sx={{
              position: 'relative', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              m:1,
              zIndex: 5, 
            }}
          >
            <IconButton
              onClick={toggleExpressions}
              aria-label={showExpressions ? "İfadeleri Gizle" : "İfadeleri Göster"}
              sx={{
                borderRadius: "50%",
                background: showExpressions
                  ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                  : `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.card})`,
                boxShadow: `0 6px 16px ${theme.palette.background.elevation[2]}`,
                "&:hover": {
                  boxShadow: `0 8px 20px ${theme.palette.background.elevation[3]}`,
                  filter: "brightness(1.2)",
                },
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                width: 40,
                height: 40,
                border: `2px solid ${theme.palette.background.offwhite}`,
                p: 0.5,
                color: showExpressions ? theme.palette.warning.contrastText : theme.palette.text.primary,
              }}
            >
              {showExpressions ? <HideExpressionsIcon /> : <ShowExpressionsIcon />}
            </IconButton>
            
            <IconButton
              onClick={toggleChat}
              aria-label={isChatOpen ? "Sohbeti Gizle" : "Sohbeti Göster"}
              sx={{
                borderRadius: "50%",
                background: isChatOpen
                  ? `linear-gradient(135deg, ${theme.palette.success.dark || theme.palette.success.main}, ${theme.palette.success.main})`
                  : `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
                boxShadow: `0 6px 16px ${theme.palette.background.elevation[2]}`,
                "&:hover": {
                  boxShadow: `0 8px 20px ${theme.palette.background.elevation[3]}`,
                  filter: "brightness(1.2)",
                },
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                width: 40,
                height: 40,
                border: `2px solid ${theme.palette.background.offwhite}`,
                p: 0.5,
                color: theme.palette.text.contrast, 
              }}
            >
              {isChatOpen ? <CollapseIcon /> : <MessageIcon />}
            </IconButton>
          </Box>

          {/* Chat Area - Right Side (Slidable) */}
          <Box
            sx={{
              width: isChatOpen ? "30%" : "0%", 
              minWidth: isChatOpen ? "250px" : "0%", 
              maxWidth: "350px", 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out, opacity 0.3s ease-in-out',
              opacity: isChatOpen ? 1 : 0,
              boxSizing: 'border-box',
            }}
          >
            {isChatOpen && ( 
                <ChatArea
                expressions={expressions}
                onSendExpression={handleSendExpression}
                isChatOpen={isChatOpen}
                t={t}
                />
            )}
          </Box>
        </Box>
        
        <QuickExpressionButtons
            onSendExpression={handleSendExpression}
            position="relative" 
            showToggleButton={true}
            containerProps={{
                sx: {
                    position: 'absolute', 
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 15, 
                }
            }}
        />
      </Box>
    </Paper>
  );
};

export default GameArea;
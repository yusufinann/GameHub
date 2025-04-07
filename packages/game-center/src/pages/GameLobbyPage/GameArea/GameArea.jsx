import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import {
  KeyboardArrowLeft as CollapseIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
import { v4 as uuidv4 } from "uuid";
import { GameSettingsContext } from "../../GameDetail/GameDetailRightArea/context";
import GameAreaHeader from "./components/GameAreaHeader/GameAreaHeader";
import GameContentArea from "./components/GameContentArea/GameContentArea";
import ChatArea from "./components/ChatArea/ChatArea";

const GameArea = ({ lobbyInfo, members, isHost, onDelete, onLeave, isDeletingLobby, isLeavingLobby }) => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const [expressions, setExpressions] = useState([]);
  const [centerExpressions, setCenterExpressions] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const { soundEnabled, toggleSound, soundEnabledRef } = useContext(GameSettingsContext);

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

  return (
    <Paper
      elevation={12}
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
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
      {/* Header Component */}
      <GameAreaHeader
        lobbyInfo={lobbyInfo}
        isHost={isHost}
        onDelete={onDelete}
        onLeave={onLeave}
        isDeletingLobby={isDeletingLobby}
        isLeavingLobby={isLeavingLobby}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          p: 1,
          position: "relative",
          flexDirection: "column",
        }}
      >
        {/* Game and Chat Container */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Game Content Area - Left Side */}
          <GameContentArea
            lobbyInfo={lobbyInfo}
            currentUser={currentUser}
            socket={socket}
            members={members}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            soundEnabledRef={soundEnabledRef}
            centerExpressions={centerExpressions}
            onSendExpression={handleSendExpression}
            isChatOpen={isChatOpen}
          />

          {/* Chat Toggle Button */}
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
              transition: 'width 0.3s ease-in-out',
              ml: isChatOpen ? 2 : 0,
              opacity: isChatOpen ? 1 : 0,
            }}
          >
            <ChatArea
              expressions={expressions}
              onSendExpression={handleSendExpression}
              isChatOpen={isChatOpen}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default GameArea;
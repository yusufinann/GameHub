import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ExitToApp as ExitIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from "@mui/icons-material";
import { BingoGame } from "@gamecenter/bingo-game";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
import { v4 as uuidv4 } from "uuid";
import ExpressionPanel from "./ExpressionPanel";
import QuickExpressionButtons from "./QuickExpressionButtons";
import ExpressionHistory from "./ExpressionHistory";
import MessageIcon from "@mui/icons-material/Message";
import { useEffect, useState } from "react";

const GameArea = ({ lobbyInfo, members, isHost, onDelete, onLeave }) => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const [expressions, setExpressions] = useState([]);
  const [centerExpressions, setCenterExpressions] = useState([]);
  const [isExpressionAreaOpen, setIsExpressionAreaOpen] = useState(true);

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
    const animationType = expressionData.animationType;

    setCenterExpressions((prevExpressions) => [
      ...prevExpressions,
      { ...expressionData, id: expressionId, animationType },
    ]);

    setTimeout(() => {
      setCenterExpressions((prevExpressions) =>
        prevExpressions.filter((expr) => expr.id !== expressionId)
      );
    }, 3000);
  };

  const handleToggleExpressionArea = () => {
    setIsExpressionAreaOpen(!isExpressionAreaOpen);
  };

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
          backgroundImage: `url('https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg')`,
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
              Delete Lobby
            </Button>
          )}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ExitIcon />}
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
            Leave Lobby
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "auto",
          p: 1,
          position: "relative",
        }}
      >
        {/* Game Area - Left Side*/}
        <Box sx={{ flex: '0 0 80%', maxWidth: '70%', display: 'flex', flexDirection: 'column' }}>
          {/* Center Screen Expression Area */}
          <ExpressionPanel centerExpressions={centerExpressions} />

          {/* Bingo Game */}
          {lobbyInfo.game === "1" ? (
            <Box sx={{height:'70vh'}}>
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
          {/* Quick Expression Buttons moved here */}
          <QuickExpressionButtons onSendExpression={handleSendExpression} />
        </Box>

        {/* Chat & Expression Area - Right Side (Collapsible) */}
        <Box sx={{ flex: '1', display: 'flex', flexDirection: 'column', width:'30%',height:'100%'}}>
          {/* Toggle Button */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton
              onClick={handleToggleExpressionArea}
              aria-label={isExpressionAreaOpen ? "Sohbeti Gizle" : "Sohbeti Göster"}
              sx={{
                borderRadius: "50%",
                background: isExpressionAreaOpen
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
              {isExpressionAreaOpen ? (
                <ExpandLessIcon sx={{ color: "white", fontSize: 24 }} />
              ) : (
                <MessageIcon sx={{ color: "white", fontSize: 20 }} />
              )}
            </IconButton>
          </Box>

          {/* Collapsible Expression Input and History Area */}
          <Collapse
            in={isExpressionAreaOpen}
            collapsedSize="30px"
            sx={{
              transitionDuration: "500ms",
              overflow: 'hidden',
              borderRadius: '12px',
              background: "linear-gradient(to bottom, #b2ebf2, white)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Box p={1}>

              {/* Expression History */}
              <ExpressionHistory expressions={expressions} />
                  {/* Expression Input Area */}
               <ExpressionPanel.Input onSendExpression={handleSendExpression} />

            </Box>
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
};

export default GameArea;
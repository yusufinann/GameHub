import React, { useState,useEffect} from "react";
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
  KeyboardArrowDown as ExpandMoreIcon,
} from "@mui/icons-material";

import { BingoGame } from "@gamecenter/bingo-game";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
import { v4 as uuidv4 } from "uuid";
import ExpressionPanel from "./ExpressionPanel";
import ExpressionHistory from "./ExpressionHistory";
import MessageIcon from '@mui/icons-material/Message';
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
      };
      socket.send(JSON.stringify(messagePayload));
    }
  };

  const displayCenterExpression = (expressionData) => {
    const expressionId = uuidv4();
    const animationType = expressionData.animationType 

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
      elevation={8}
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 255, 0.9))",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(90deg, #1a237e, #283593, #1a237e)",
          color: "white",
          boxShadow: "0 4px 20px rgba(26, 35, 126, 0.2)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "white",
          }}
        >
          <GameIcon fontSize="large"/>
          {lobbyInfo.lobbyName}
          <Typography
            variant="h4"
            sx={{
              color: "#ffb300",
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <StarsIcon fontSize="large"/>
           {lobbyInfo.game==="1" ? "Bingo Game" : "Other Game"}  
          </Typography>
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
          
          {isHost && (
            <Button
              variant="contained"
              color="error"
              onClick={onDelete}
              startIcon={<ExitIcon />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                "&:hover": {
                  boxShadow: "0 6px 14px rgba(0,0,0,0.3)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
                fontWeight: "bold",
                px: 3,
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
              borderRadius: "12px",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
                transform: "translateY(-2px)",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
              transition: "all 0.3s ease",
              fontWeight: "bold",
              border: "2px solid white",
              px: 3,
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
          p: 2,
          position: "relative",
          flexDirection: 'column'
        }}
      >
        {/* Center Screen Expression Area */}
        <ExpressionPanel centerExpressions={centerExpressions} />

        {/* Game Area */}
        {lobbyInfo.game === "1" ? (
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
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              },
              "& .MuiCardContent-root": {
                flex: 1,
                overflow: "auto",
              },
            }}
            lobbyCode={lobbyInfo.lobbyCode}
            socket={socket}
            currentUser={currentUser}
            lobbyInfo={lobbyInfo}
            members={members}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%"
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Other Game
            </Typography>
          </Box>
        )}
      </Box>

   {/* Toggle Button Container*/}
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    position: "relative",
    mt: -3, 
    mb: 3,  
    zIndex: 10, 
  }}
>
  <IconButton
    onClick={handleToggleExpressionArea}
    aria-label={isExpressionAreaOpen ? 'Hide chat' : 'Show chat'}
    sx={{
      borderRadius: "50%",
      background: isExpressionAreaOpen 
        ? "linear-gradient(135deg, #3f51b5, #1a237e)" 
        : "linear-gradient(135deg, #4caf50, #2e7d32)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      "&:hover": {
        boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
        transform: "translateY(-3px) scale(1.05)",
        filter: "brightness(1.1)",
      },
      transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      width: 48,
      height: 48,
      border: "2px solid white",
      p: 0.5,
    }}
  >
    {isExpressionAreaOpen ? (
      <ExpandMoreIcon sx={{ color: "white", fontSize: 28 }} />
    ) : (
      <MessageIcon sx={{ color: "white", fontSize: 24 }} />
    )}
  </IconButton>
</Box>

{/* Expression Input and History Area - Collapsible */}
<Collapse 
  in={isExpressionAreaOpen} 
  collapsedSize={0} 
  style={{ transitionDuration: '400ms' }}
>
  <Box 
    sx={{ 
      overflow: 'hidden',
      boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      background: "linear-gradient(to bottom, #f5f5f5, white)",
    }}
  > 
    {/* Expression Input Area */}
    <ExpressionPanel.Input onSendExpression={handleSendExpression} />

    {/* Expression History */}
    <ExpressionHistory expressions={expressions} />
  </Box>
</Collapse>
    </Paper>
  );
};

export default GameArea;
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  styled,
  keyframes,
  alpha,
} from "@mui/material";

import {
  Send as SendIcon,
  InsertEmoticon as EmoticonIcon,
} from "@mui/icons-material";

import EmojiPickerPanel from "./EmojiPickerPanel";
import { useTranslation } from "react-i18next";

// Animation
const expressionSlideUpFadeOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  10%, 90% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.9);
  }
`;

const AnimatedExpressionBox = styled(Box)(({ theme, $animationType }) => {
  const animations = {
    default: `${expressionSlideUpFadeOut} 3s ease-out forwards`,
  };

  const selectedAnimation = animations[$animationType] || animations.default;

  return {
    padding: theme.spacing(2, 4),
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    borderRadius: "24px",
    boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
    marginBottom: theme.spacing(2),
    animation: selectedAnimation,
    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    backdropFilter: "blur(8px)",
    maxWidth: "70%",
    margin: "0 auto",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "24px",
      background: `linear-gradient(135deg, ${alpha(
        theme.palette.primary.light,
        0.2
      )}, transparent)`,
      zIndex: -1,
    },
  };
});

// Main Expression Panel Component
const ExpressionPanel = ({ centerExpressions}) => {
  if (centerExpressions.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: "70%",     // Sayfanın daha aşağısı
        left: "10%",    // Sayfanın daha sağı
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        padding: 1,
        transform: "translate(-50%, -50%)",
      }}
    >
      {centerExpressions.map((expr) => (
        <AnimatedExpressionBox
          key={expr.id}
          $animationType={expr.animationtype || "default"}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Avatar
                src={expr.senderAvatar || undefined}
                sx={{ bgcolor: "primary.main", border: "2px solid white", boxShadow: "0 3px 5px rgba(0,0,0,0.2)" }}
              >
                {!expr.senderAvatar && expr.senderName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.dark", textAlign: "center" }}>
                  {expr.senderName}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", fontSize: "0.8em" }}>
                  @{expr.senderUsername}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: "text.primary",
              textAlign: "center",
              marginTop: "8px",
              fontSize: "2rem",
              fontWeight: expr.expression.length < 3 ? "bold" : "normal",
            }}
          >
            {expr.expression}
          </Typography>
        </AnimatedExpressionBox>
      ))}
    </Box>
  );
};


const ExpressionInput = ({ onSendExpression,t}) => {
  const [expressionInput, setExpressionInput] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const emojiPickerRef = useRef(null);
  const handleSendExpression = (expressionToSend) => {
    const expression = expressionToSend || expressionInput;
    if (expression.trim()) {
      onSendExpression(expression);
      setExpressionInput("");

      if (expressionToSend) {
        setEmojiPickerOpen(false);
      }
    }
  };

  const handleInputChange = (event) => {
    setExpressionInput(event.target.value);
  };

  const toggleEmojiPicker = () => {
    setEmojiPickerOpen(!emojiPickerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    };

    if (emojiPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerOpen]);

  return (
    <Box
      sx={{
        p: 2,
        borderTop: "2px solid #1a237e",
        background: "linear-gradient(180deg, rgba(240, 240, 255, 0.6), rgba(255, 255, 255, 0.9))",
        boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
        position: 'relative',
        height:'10vh'
      }}
    >
      <EmojiPickerPanel
        emojiPickerOpen={emojiPickerOpen}
        setEmojiPickerOpen={setEmojiPickerOpen}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        handleSendExpression={handleSendExpression}
        emojiPickerRef={emojiPickerRef}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          color="primary"
          aria-label="emoji"
          onClick={toggleEmojiPicker}
          sx={{
            bgcolor: emojiPickerOpen ? "primary.light" : "transparent",
            color: emojiPickerOpen ? "white" : "primary.main",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.1)",
              bgcolor: emojiPickerOpen ? "primary.main" : "primary.light",
              color: "white",
            },
          }}
        >
          <EmoticonIcon fontSize="large" />
        </IconButton>
        <TextField
          fullWidth
          placeholder={t('sendMessagePlaceholder')}
          variant="outlined"
          size="medium"
          value={expressionInput}
          onChange={handleInputChange}
          onKeyPress={(ev) => {
            if (ev.key === "Enter") {
              handleSendExpression();
              ev.preventDefault();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "24px",
              bgcolor: "background.paper",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: 2,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: 2,
              },
            },
          }}
          InputProps={{ sx: { pl: 2 } }}
        />
        <IconButton
          color="primary"
          aria-label="send"
          onClick={() => handleSendExpression()}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: "48px",
            height: "48px",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "primary.dark",
              transform: "scale(1.1)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            },
          }}
        >
          <SendIcon fontSize="medium" />
        </IconButton>
      </Box>
    </Box>
  );
};

ExpressionPanel.Input = ExpressionInput;

export default ExpressionPanel;
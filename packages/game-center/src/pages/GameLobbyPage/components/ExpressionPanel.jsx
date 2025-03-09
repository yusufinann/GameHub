import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Button,
  Chip,
  Tooltip,
  Zoom,
  Fade,
  styled,
  keyframes,
  alpha,
} from "@mui/material";

import {
  Send as SendIcon,
  InsertEmoticon as EmoticonIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Celebration as CelebrationIcon,
  Favorite as HeartIcon,
  ThumbUp as ThumbUpIcon,
  SportsEsports as GameIcon,
} from "@mui/icons-material";



const fadeInSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;


const expressionFadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  10%, 90% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
`;

// Predefined expressions
const predefinedExpressions = [
  "👍", "😂", "❤️", "🎉", "😮", "👏", "💯", "🤔", "🙏", "🔥", "🤝", "🤩",
];

// Emoji categories
const emojiCategories = [
  {
    name: "Yüz İfadeleri",
    icon: <EmojiEmotionsIcon />,
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "😍", "🥰", "😘", "😜", "😎", "🤩", "😱", "🥺", "😴"],
  },
  {
    name: "Jestler",
    icon: <ThumbUpIcon />,
    emojis: ["👍", "👏", "👋", "🙌", "🤝", "✌️", "🤙", "💪", "👊", "🙏", "🫶", "🤲", "🫂", "🤗", "👀", "💯"],
  },
  {
    name: "Kutlama",
    icon: <CelebrationIcon />,
    emojis: ["🎉", "🎊", "🎁", "🎂", "🍾", "🥂", "🏆", "🏅", "🎯", "⭐", "✨", "🌟", "💫", "🔥", "❄️", "🎮"],
  },
  {
    name: "Kalpler",
    icon: <HeartIcon />,
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💖", "💗", "💓", "💝"],
  },
  {
    name: "Oyun",
    icon: <GameIcon />,
    emojis: ["🎮", "🎲", "🎯", "🎪", "🎭", "🎨", "🧩", "♟️", "🎪", "🎯", "🎪", "🚀", "🏁", "🎫", "🎟️", "🧸"],
  },
];

// Styled components
const AnimatedExpressionBox = styled(Box)(({ theme }) => {
  const animations = {
    default: `${expressionFadeInOut} 3s ease-out forwards`,
  };

  const selectedAnimation = animations.default;

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
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, transparent)`,
      zIndex: -1,
    },
  };
});

const EmojiButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  height: "48px",
  width: "48px",
  borderRadius: "50%",
  fontSize: "24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: theme.spacing(0.5),
  padding: 0,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(5px)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.15)",
    boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
    background: alpha(theme.palette.primary.light, 0.15),
    border: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

// Main Expression Panel Component
const ExpressionPanel = ({ centerExpressions }) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 4,
      }}
    >
      {centerExpressions.map((expr) => (
        <AnimatedExpressionBox
          key={expr.id}
          animationType={"default"}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  border: "2px solid white",
                  boxShadow: "0 3px 5px rgba(0,0,0,0.2)"
                }}
              >
                {expr.senderName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.dark",
                    textAlign: "center",
                  }}
                >
                  {expr.senderName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textAlign: "center",
                    fontSize: "0.8em",
                  }}
                >
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
              fontWeight: expr.expression.length < 3 ? "bold" : "normal"
            }}
          >
            {expr.expression}
          </Typography>
        </AnimatedExpressionBox>
      ))}
    </Box>
  );
};

// Input Component
const ExpressionInput = ({ onSendExpression }) => {
  const [expressionInput, setExpressionInput] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSendExpression = (expressionToSend) => {
    const expression = expressionToSend || expressionInput;
    if (expression.trim()) {
      onSendExpression(expression);
      setExpressionInput("");
      
      // Close emoji picker if sending a selected emoji
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

  return (
    <Box
      sx={{
        p: 2,
        borderTop: "2px solid #1a237e",
        background: "linear-gradient(180deg, rgba(240, 240, 255, 0.6), rgba(255, 255, 255, 0.9))",
        boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* Emoji Picker Panel */}
      <Fade in={emojiPickerOpen}>
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            display: emojiPickerOpen ? "block" : "none",
            animation: `${fadeInSlideUp} 0.3s ease-out`,
          }}
        >
          {/* Emoji Categories */}
          <Box sx={{ display: "flex", mb: 2, justifyContent: "center" }}>
            {emojiCategories.map((category, index) => (
              <Tooltip key={index} title={category.name} TransitionComponent={Zoom}>
                <Chip
                  icon={category.icon}
                  label={category.name}
                  onClick={() => setActiveCategory(index)}
                  color={activeCategory === index ? "primary" : "default"}
                  sx={{
                    mx: 0.5,
                    fontWeight: activeCategory === index ? "bold" : "normal",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>

          {/* Active Category Emojis */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {emojiCategories[activeCategory].emojis.map((emoji, index) => (
              <Zoom key={index} in={true} style={{ transitionDelay: `${index * 30}ms` }}>
                <EmojiButton
                  onClick={() => handleSendExpression(emoji)}
                  variant="outlined"
                >
                  {emoji}
                </EmojiButton>
              </Zoom>
            ))}
          </Box>
        </Box>
      </Fade>

      {/* Text Input Area */}
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
          placeholder="Bir ifade gönderin..."
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
          InputProps={{
            sx: { pl: 2 }
          }}
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

      {/* Quick Emoji Access */}
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          mt: 1.5,
          gap: 0.5,
          overflowX: "auto",
          px: 1,
          pb: 1,
          "::-webkit-scrollbar": {
            height: "6px",
          },
          "::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.05)",
            borderRadius: "10px",
          },
          "::-webkit-scrollbar-thumb": {
            background: "rgba(26, 35, 126, 0.3)",
            borderRadius: "10px",
            "&:hover": {
              background: "rgba(26, 35, 126, 0.5)",
            },
          }
        }}
      >
        {predefinedExpressions.map((emoji, index) => (
          <Button
            key={index}
            onClick={() => handleSendExpression(emoji)}
            variant="outlined"
            sx={{
              minWidth: "auto",
              width: "40px",
              height: "40px",
              fontSize: "20px",
              borderRadius: "12px",
              p: 0,
              mx: 0.2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px solid",
              borderColor: "primary.light",
              color: "primary.main",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                bgcolor: "primary.light",
                color: "white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            {emoji}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

// Connect subcomponents
ExpressionPanel.Input = ExpressionInput;

export default ExpressionPanel;
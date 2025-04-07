import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Tooltip,
  Zoom,
  Fade,
  Chip,
  Button,
  IconButton,
  styled,
  keyframes,
  alpha,
} from "@mui/material";
import {
  EmojiEmotions as EmojiEmotionsIcon,
  ThumbUp as ThumbUpIcon,
  Celebration as CelebrationIcon,
  Favorite as HeartIcon,
  SportsEsports as GameIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
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

const EmojiButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  height: "42px",
  width: "42px",
  borderRadius: "50%",
  fontSize: "22px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: theme.spacing(0.3),
  padding: 0,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: "blur(5px)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
    background: alpha(theme.palette.primary.light, 0.15),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
  zIndex: 2,
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
}));

const EmojiPickerPanel = ({ emojiPickerOpen, setEmojiPickerOpen, activeCategory, setActiveCategory, handleSendExpression, emojiPickerRef }) => {
  const categoriesRef = useRef(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (categoriesRef.current) {
      const container = categoriesRef.current;
      setShowLeftNav(scrollPosition > 0);
      setShowRightNav(container.scrollWidth > container.clientWidth + scrollPosition);
    }
  }, [scrollPosition, emojiPickerOpen]);

  const handleScroll = (direction) => {
    if (categoriesRef.current) {
      const container = categoriesRef.current;
      const scrollAmount = direction === 'left' ? -100 : 100;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      setTimeout(() => {
        setScrollPosition(container.scrollLeft);
      }, 300);
    }
  };

  const handleScrollEvent = () => {
    if (categoriesRef.current) {
      setScrollPosition(categoriesRef.current.scrollLeft);
    }
  };

  return (
    <Fade in={emojiPickerOpen}>
      <Box
        ref={emojiPickerRef}
        sx={{
          p: 1,
          mb: 1.5,
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          display: emojiPickerOpen ? "block" : "none",
          animation: `${fadeInSlideUp} 0.3s ease-out`,
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          zIndex: 1,
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Emoji Categories with Navigation */}
        <Box sx={{ position: 'relative' }}>
          {showLeftNav && (
            <NavigationButton
              size="small"
              onClick={() => handleScroll('left')}
              sx={{ left: 0 }}
            >
              <NavigateBeforeIcon />
            </NavigationButton>
          )}
          
          <Box
            ref={categoriesRef}
            onScroll={handleScrollEvent}
            sx={{
              display: "flex",
              mb: 1.5,
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none", 
              "&::-webkit-scrollbar": { display: "none" }, 
              px: 2, 
            }}
          >
            {emojiCategories.map((category, index) => (
              <Tooltip key={index} title={category.name} TransitionComponent={Zoom}>
                <Chip
                  icon={category.icon}
                  label={category.name}
                  onClick={() => setActiveCategory(index)}
                  color={activeCategory === index ? "primary" : "default"}
                  size="small"
                  sx={{
                    mx: 0.3,
                    fontSize: '0.8rem',
                    fontWeight: activeCategory === index ? "bold" : "normal",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          
          {showRightNav && (
            <NavigationButton
              size="small"
              onClick={() => handleScroll('right')}
              sx={{ right: 0 }}
            >
              <NavigateNextIcon />
            </NavigationButton>
          )}
        </Box>

        {/* Active Category Emojis */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {emojiCategories[activeCategory]?.emojis?.map((emoji, index) => (
            <Zoom key={index} in={true} style={{ transitionDelay: `${index * 20}ms` }}>
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
  );
};

export default EmojiPickerPanel;
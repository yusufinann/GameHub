import React, { useState, useRef, useEffect } from "react";
import { Box, Zoom, Fade, Chip } from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
} from "@mui/icons-material";
import {
  fadeInSlideUp,
  emojiCategories,
  EmojiButton,
  NavigationButton,
} from "./EmojiPicker.components"; 

const EmojiPickerPanel = ({
  emojiPickerOpen,
  activeCategory,
  setActiveCategory,
  handleSendExpression,
  emojiPickerRef,
}) => {
  const categoriesRef = useRef(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);

  const checkNavButtons = () => {
    if (categoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current;
      setShowLeftNav(scrollLeft > 0);
      setShowRightNav(scrollWidth > clientWidth + scrollLeft);
    }
  };

  useEffect(() => {
    checkNavButtons();
    window.addEventListener("resize", checkNavButtons);
    return () => window.removeEventListener("resize", checkNavButtons);
  }, [emojiPickerOpen]);

  const handleScroll = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = direction === "left" ? -150 : 150;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  
  const handleScrollEvent = () => {
    setTimeout(checkNavButtons, 150);
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
          position: "absolute",
          bottom: "100%",
          left: 0,
          right: 0,
          zIndex: 1,
          maxWidth: "400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Box sx={{ position: "relative", display: 'flex', alignItems: 'center' }}>
          {showLeftNav && (
            <NavigationButton
              size="small"
              onClick={() => handleScroll("left")}
              sx={{ left: -8 }}
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
              px: 0.5,
            }}
          >
            {emojiCategories.map((category, index) => (
              <Chip
                key={category.name}
                icon={category.icon}
                label={category.name}
                onClick={() => setActiveCategory(index)}
                color={activeCategory === index ? "primary" : "default"}
                size="small"
                sx={{
                  mx: 0.5,
                  cursor: 'pointer',
                  fontWeight: activeCategory === index ? "bold" : "normal",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  },
                }}
              />
            ))}
          </Box>

          {showRightNav && (
            <NavigationButton
              size="small"
              onClick={() => handleScroll("right")}
              sx={{ right: -8 }}
            >
              <NavigateNextIcon />
            </NavigationButton>
          )}
        </Box>
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
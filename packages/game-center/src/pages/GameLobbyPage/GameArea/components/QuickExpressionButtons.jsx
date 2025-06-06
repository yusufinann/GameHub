import React, { useState, useCallback, useMemo } from "react";
import { Box, Button, IconButton, useMediaQuery } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

const predefinedExpressions = [
  "👍", "😂", "❤️", "🎉", "😮", "👏", "💯", "🤔", "🙏", "🔥", "🤝", "🤩",
];

// Diğer styled component'leriniz aynı kalabilir
const QuickEmojiButton = styled(Button)(({ theme, size }) => ({
  minWidth: "auto",
  width: size === "small" ? "40px" : "50px",
  height: size === "small" ? "40px" : "50px",
  fontSize: size === "small" ? "20px" : "24px",
  borderRadius: "12px",
  padding: 0,
  margin: '0 2px',
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "2px solid",
  borderColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.3)}`,
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
}));

const CollapsibleHandle = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: -32,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: alpha(theme.palette.primary.main, 0.95),
  padding: "2px 16px",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 -4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
  transition: "all 0.3s ease",
  '&:hover': {
    paddingTop: 4,
    backgroundColor: theme.palette.primary.main,
  },
}));

const EmojiIconStyled = styled(EmojiEmotionsIcon)(({ theme }) => ({
  fontSize: "1.6rem",
  filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.primary.main, 0.2)})`,
}));


const QuickExpressionPanelStyled = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded' 
})(({ theme, isExpanded }) => ({ 
  position: "absolute",
  bottom: isExpanded ? 0 : -72, 
  left: 0,
  right: 0,
  height: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "nowrap",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  zIndex: 10,
  boxShadow: `0 -4px 10px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: "bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
}));

const RelativeModeToggleButton = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  width: 60,
  height: 40,
  padding: theme.spacing(0, 1),
  borderRadius: "12px 12px 0 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 5,
  boxShadow: `
    0 -4px 12px ${alpha(theme.palette.common.black, 0.15)},
    inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
  `,
  transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -1, left: -1, right: -1,
    height: '2px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    borderRadius: '12px 12px 0 0',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    filter: 'brightness(1.1)',
    transform: "translateX(-50%) translateY(-3px)",
    boxShadow: `
      0 -6px 20px ${alpha(theme.palette.common.black, 0.2)},
      0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)},
      inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}
    `,
    '&::before': {
      opacity: 0.8,
    },
  },
  '&:active': {
    transform: "translateX(-50%) translateY(-1px)",
    filter: 'brightness(0.95)',
    transition: "all 0.1s ease",
  },
}));

const panelId = "quick-expression-panel";

const QuickExpressionButtons = ({
  onSendExpression,
  position = "fixed",
  showToggleButton = true,
  containerProps = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [isExpanded, setIsExpanded] = useState(false);

  const displayCount = useMemo(() => (isMobile ? 6 : isTablet ? 8 : predefinedExpressions.length), [isMobile, isTablet]);
  const buttonSize = useMemo(() => (isMobile ? "small" : "medium"), [isMobile]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleSendExpression = useCallback((emoji) => {
    onSendExpression(emoji);
  }, [onSendExpression]);

  const renderedExpressions = useMemo(() => (
    predefinedExpressions.slice(0, displayCount).map((emoji, index) => (
      <QuickEmojiButton
        key={index}
        onClick={() => handleSendExpression(emoji)}
        variant="outlined"
        size={buttonSize}
      >
        {emoji}
      </QuickEmojiButton>
    ))
  ), [displayCount, buttonSize, handleSendExpression]);


  if (position === "relative") {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "auto",
          minHeight: isExpanded ? '80px' : '40px',
          ...containerProps.sx
        }}
        {...containerProps}
      >
        {showToggleButton && (
          <RelativeModeToggleButton
            onClick={handleToggleExpand}
            aria-label="Hızlı İfadeler panelini aç/kapat"
            aria-expanded={isExpanded}
            aria-controls={panelId}
          >
            <EmojiIconStyled />
          </RelativeModeToggleButton>
        )}

        <QuickExpressionPanelStyled id={panelId} isExpanded={isExpanded}> 
          {isExpanded && (
            <CollapsibleHandle
              onClick={handleToggleExpand}
              aria-label="Hızlı İfadeler panelini daralt"
              aria-expanded={true}
              aria-controls={panelId}
            >
              <IconButton
                size="small"
                sx={{
                  color: theme.palette.common.white,
                  p: 0.5,
                  transition: "transform 0.3s ease",
                  transform: 'rotate(0deg)',
                }}
              >
                <KeyboardArrowUpIcon fontSize="small" />
              </IconButton>
            </CollapsibleHandle>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
              gap: 0.5,
              maxWidth: "100%",
              pb: 0.5,
              pt: isExpanded ? theme.spacing(3) : (showToggleButton ? 0 : theme.spacing(1)),
              px: 1,
              "::-webkit-scrollbar": { height: "6px" },
              "::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.05)", borderRadius: "12px" },
              "::-webkit-scrollbar-thumb": { background: alpha(theme.palette.primary.main, 0.5), borderRadius: "12px", "&:hover": { background: alpha(theme.palette.primary.main, 0.7) } }
            }}
          >
            {renderedExpressions}
          </Box>
        </QuickExpressionPanelStyled>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: isExpanded ? 0 : -72, 
        left: 0,
        right: 0,
        height: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        py: 1.5,
        px: 2,
        zIndex: 1100,
        boxShadow: `0 -4px 10px ${alpha(theme.palette.common.black, 0.1)}`,
        transition: "bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        ...containerProps.sx
      }}
      {...containerProps}
    >
      {showToggleButton && (
        <CollapsibleHandle
            onClick={handleToggleExpand}
            aria-label={isExpanded ? "Hızlı İfadeler panelini daralt" : "Hızlı İfadeler panelini genişlet"}
            aria-expanded={isExpanded}
            aria-controls={panelId}
        >
          <IconButton
            size="medium"
            sx={{
              color: theme.palette.common.white,
              p: 0.8,
              transition: "transform 0.3s ease",
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <EmojiIconStyled /> }
          </IconButton>
        </CollapsibleHandle>
      )}

      <Box
        id={panelId} 
        sx={{
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          gap: 0.5,
          maxWidth: "100%",
          pb: 0.5,
          pt: showToggleButton ? theme.spacing(3) : theme.spacing(1),
          px: 1,
          "::-webkit-scrollbar": { height: "6px" },
          "::-webkit-scrollbar-track": { background: "rgba(0,0,0,0.05)", borderRadius: "12px" },
          "::-webkit-scrollbar-thumb": { background: alpha(theme.palette.primary.main, 0.5), borderRadius: "12px", "&:hover": { background: alpha(theme.palette.primary.main, 0.7) } }
        }}
      >
        {renderedExpressions}
      </Box>
    </Box>
  );
};

export default QuickExpressionButtons;
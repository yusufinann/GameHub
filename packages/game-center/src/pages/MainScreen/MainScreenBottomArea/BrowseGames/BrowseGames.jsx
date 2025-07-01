import React, { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Button, 
  useTheme, 
  useMediaQuery, 
  CircularProgress, 
  Tooltip,
  Fade 
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useGames } from '../../../../service/useGames';
import { useTranslation } from 'react-i18next';

const CATEGORY_COLORS = ['#2196f3', '#4caf50', '#f44336', '#ff9800', '#9c27b0'];

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const getCategoryColor = (index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length];

const BrowseGames = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const { data: games = [], loading, error } = useGames({ limit: 10, offset: 20 });
  
  const displayCount = useMemo(() => isMobile ? 1 : 4, [isMobile]);
  const maxSteps = games.length;
  const maxIndex = useMemo(() => Math.max(0, maxSteps - displayCount), [maxSteps, displayCount]);

  const handleNext = useCallback(() => {
    setActiveStep(prevStep => prevStep === maxIndex ? 0 : prevStep + 1);
  }, [maxIndex]);

  const handleBack = useCallback(() => {
    setActiveStep(prevStep => prevStep === 0 ? maxIndex : prevStep - 1);
  }, [maxIndex]);

  const handleStepChange = useCallback((step) => {
    setActiveStep(step);
  }, []);

  const visibleCategories = useMemo(() => {
    const visible = [];
    for (let i = 0; i < displayCount && i < maxSteps; i++) {
      const index = (activeStep + i) % maxSteps;
      visible.push(games[index]);
    }
    return visible;
  }, [games, activeStep, displayCount, maxSteps]);

  const themeValues = useMemo(() => ({
    primaryDark: theme.palette.primary.dark,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    textContrast: theme.palette.text.contrast || 'white'
  }), [theme]);

  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '40vh', 
        backgroundColor: themeValues.primaryDark,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress color="success" size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '40vh', 
        backgroundColor: themeValues.primaryDark,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}>
        <Typography 
          color="error" 
          sx={{ textAlign: 'center' }}
          variant="h6"
        >
          {t("Error")}: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!games.length) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '40vh', 
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography variant="h6" color="textSecondary">
          {t("No games available")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: '40vh', 
      backgroundColor: 'transparent'
    }}>     
      <Box sx={{ 
        display: 'flex',
        height: 'calc(40vh - 40px)',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center'
      }}>
        {maxSteps > displayCount && (
          <Fade in timeout={300}>
            <IconButton
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                marginTop: '-20px',
                backgroundColor: themeValues.textPrimary,
                color: 'white',
                zIndex: 3,
                width: 40,
                height: 40,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: themeValues.textSecondary
                }
              }}
              onClick={handleBack}
              aria-label="Previous games"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Fade>
        )}

        <Box sx={{ 
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          gap: 3,
          px: maxSteps > displayCount ? 7 : 2
        }}>
          {visibleCategories.map((game, idx) => {
            const categoryColor = getCategoryColor(idx);
            const titleMaxLength = isMobile ? 7 : 12;
            const displayTitle = truncateText(game.title, titleMaxLength);
            
            return (
              <Fade 
                key={`${game.id}-${activeStep}-${idx}`} 
                in 
                timeout={400}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    flex: 1,
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    '&:hover': {
                      boxShadow: '0 12px 35px rgba(0,0,0,0.35), 0 4px 15px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      backgroundImage: `url(${game.thumbnail || '/images/game-placeholder.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      height: '100%',
                      width: '100%',
                      position: 'relative',
                      borderRadius: '14px',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.1) 100%)',
                        borderRadius: '14px',
                        zIndex: 1
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.15) 0%, rgba(156, 39, 176, 0.15) 100%)',
                        borderRadius: '14px',
                        zIndex: 1,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover::after': {
                        opacity: 1
                      }
                    }}
                  />
                  
                  <Tooltip 
                    title={game.title} 
                    placement="top"
                    arrow
                    enterDelay={500}
                  >
                    <Button
                      variant="contained"
                      href={game.open_giveaway_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        marginLeft: '-65px',
                        backgroundColor: 'transparent',
                        backdropFilter: 'blur(15px)',
                        color: "white",
                        borderRadius: 30,
                        minWidth: 130,
                        maxWidth: 'calc(100% - 24px)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        px: 3,
                        py: 1.5,
                        fontSize: '0.9rem',
                        zIndex: 2,
                        textTransform: 'none',
                        border: '2px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: categoryColor,
                          color: 'white',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                          border: `2px solid ${categoryColor}`
                        },
                      }}
                    >
                      {displayTitle}
                    </Button>
                  </Tooltip>
                </Box>
              </Fade>
            );
          })}
        </Box>

        {maxSteps > displayCount && (
          <Fade in timeout={300}>
            <IconButton
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                marginTop: '-20px',
                backgroundColor: themeValues.textPrimary,
                color: 'white',
                zIndex: 3,
                width: 40,
                height: 40,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: themeValues.textSecondary
                }
              }}
              onClick={handleNext}
              aria-label="Next games"
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Fade>
        )}
      </Box>
      
      {maxSteps > displayCount && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          position: 'absolute',
          bottom: 12,
          width: '100%',
          gap: 0.5
        }}>
          {Array.from({ length: Math.ceil(maxSteps / displayCount) }).map((_, index) => {
            const isActive = Math.floor(activeStep / displayCount) === index;
            return (
              <IconButton
                key={index}
                onClick={() => handleStepChange(index * displayCount)}
                sx={{
                  p: 0.5,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                aria-label={`Go to page ${index + 1}`}
              >
                <FiberManualRecordIcon
                  sx={{
                    fontSize: 12,
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                />
              </IconButton>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default BrowseGames;
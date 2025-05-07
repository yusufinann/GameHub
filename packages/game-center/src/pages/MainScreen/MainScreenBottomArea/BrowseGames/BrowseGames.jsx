import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, useTheme, useMediaQuery, CircularProgress, Tooltip } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useGames } from '../../../../service/useGames';
import { useTranslation } from 'react-i18next';

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const BrowseGames = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {t}=useTranslation();
  const { data: games, loading, error } = useGames({ limit: 10, offset: 20 });
  
  const displayCount = isMobile ? 1 : 4;
  
  if (loading) return (
    <Box sx={{ 
      width: '100%', 
      height: '40vh', 
      backgroundColor: theme.palette.primary.dark,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <CircularProgress color="success" />
    </Box>
  );

  if (error) return (
    <Box sx={{ 
      width: '100%', 
      height: '40vh', 
      backgroundColor: theme.palette.primary.dark,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Typography color="error" sx={{ textAlign: 'center', my: 2 }}>
        {t("Error")}: {error.message}
      </Typography>
    </Box>
  );
  
  const maxSteps = games.length;
  const maxIndex = Math.max(0, maxSteps - displayCount);

  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === maxIndex ? 0 : prevActiveStep + 1
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) =>
      prevActiveStep === 0 ? maxIndex : prevActiveStep - 1
    );
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const visibleCategories = [];
  for (let i = 0; i < displayCount && i < maxSteps; i++) {
    const index = (activeStep + i) % maxSteps;
    visibleCategories.push(games[index]);
  }

  const getCategoryColor = (index) => {
    const colors = ['#2196f3', '#4caf50', '#f44336', '#ff9800', '#9c27b0'];
    return colors[index % colors.length];
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '40vh', backgroundColor: theme.palette.primary.dark }}>
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 'bold',
          color: theme.palette.text.contrast,
          padding: '16px 24px',
          textTransform: 'uppercase'
        }}
      >
        {t("Browse Games")}
      </Typography>

      <Box sx={{ 
        display: 'flex',
        height: 'calc(40vh - 100px)',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center', 
      }}>
        <IconButton
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.text.primary,
            color: 'white',
            zIndex: 2,
            '&:hover': {
              backgroundColor: theme.palette.text.secondary,
            }
          }}
          onClick={handleBack}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        <Box sx={{ 
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          gap: '16px',
          padding: '0 48px'
        }}>
          {visibleCategories.map((game, idx) => {
            const categoryColor = getCategoryColor(idx);
            const titleMaxLength = isMobile ? 10 : 15;
            const displayTitle = truncateText(game.title, titleMaxLength);
            
            return (
              <Box
                key={game.id}
                sx={{
                  position: 'relative',
                  flex: 1,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)',
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
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
                      zIndex: 1
                    }
                  }}
                />
                <Tooltip title={game.title} placement="top">
                  <Button
                    variant="contained"
                    href={game.open_giveaway_url}
                    target="_blank"
                    sx={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'white',
                      color: theme.palette.primary.dark,
                      fontWeight: 'bold',
                      borderRadius: '20px',
                      minWidth: '120px',
                      maxWidth: '90%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      padding: '6px 16px',
                      '&:hover': {
                        backgroundColor: categoryColor,
                        color: theme.palette.text.contrast
                      },
                      zIndex: 2
                    }}
                  >
                    {displayTitle}
                  </Button>
                </Tooltip>
              </Box>
            );
          })}
        </Box>

        <IconButton
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.palette.text.primary,
            color: 'white',
            zIndex: 2,
            '&:hover': {
              backgroundColor: theme.palette.text.secondary,
            }
          }}
          onClick={handleNext}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        position: 'absolute',
        bottom: '8px',
        width: '100%'
      }}>
        {games.map((_, index) => (
          <FiberManualRecordIcon
            key={index}
            onClick={() => handleStepChange(index)}
            sx={{
              fontSize: '12px',
              m: '0 4px',
              cursor: 'pointer',
              color: activeStep <= index && index < activeStep + displayCount ? 'white' : 'rgba(255, 255, 255, 0.5)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BrowseGames;
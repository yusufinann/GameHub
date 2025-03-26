import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const categories = [
  {
    id: 1,
    title: 'BİLİM KURGU VE CYBERPUNK',
    image: '/images/scifi-cyberpunk.jpg',
    color: '#2196f3'
  },
  {
    id: 2,
    title: 'ZENGİN HİKÂYE',
    image: '/images/rich-story.jpg',
    color: '#4caf50'
  },
  {
    id: 3,
    title: 'EŞLİ',
    image: '/images/multiplayer.jpg',
    color: '#f44336'
  },
  {
    id: 4,
    title: 'BULMACA',
    image: '/images/puzzle.jpg',
    color: '#ff9800'
  },
  {
    id: 5,
    title: 'MACERA',
    image: 'https://wallpapercave.com/wp/wp2548290.jpg',
    color: '#9c27b0'
  }
];

const BrowseGames = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const maxSteps = categories.length;
  const displayCount = isMobile ? 1 : 4;
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
  
  // Create visible categories based on current step
  const visibleCategories = [];
  for (let i = 0; i < displayCount; i++) {
    const index = (activeStep + i) % maxSteps;
    visibleCategories.push(categories[index]);
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '40vh', backgroundColor: '#328761' }}>
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'white', 
          padding: '16px 24px',
          textTransform: 'uppercase'
        }}
      >
        Browse Games
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        height: 'calc(40vh - 100px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <IconButton
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          {visibleCategories.map((category) => (
            <Box
              key={category.id}
              sx={{
                position: 'relative',
                flex: 1,
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.03)',
                }
              }}
            >
              <Box
                sx={{
                  backgroundImage: `url(${category.image})`,
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
              <Button
                variant="contained"
                sx={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  color: '#1a2433',
                  fontWeight: 'bold',
                  borderRadius: '20px',
                  minWidth: '120px',
                  '&:hover': {
                    backgroundColor: category.color,
                    color: 'white'
                  },
                  zIndex: 2
                }}
              >
                {category.title}
              </Button>
            </Box>
          ))}
        </Box>

        <IconButton
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        {categories.map((_, index) => (
          <FiberManualRecordIcon
            key={index}
            onClick={() => handleStepChange(index)}
            sx={{
              fontSize: '12px',
              m: '0 4px',
              cursor: 'pointer',
              color: index === activeStep ? 'white' : 'rgba(255, 255, 255, 0.5)',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BrowseGames;
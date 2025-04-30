import React, { useState, useEffect } from 'react';
import { Box,useTheme } from '@mui/material';
import GameSlide from './GameSlide';
import { featuredGames } from './featuredGames';

const HighlightsSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % featuredGames.length);
  };

  const handleDotClick = (index) => {
    setActiveSlide(index);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '60vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#171a21', 
      }}
    >
      {/* Main Slider */}
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          transition: 'transform 0.5s ease',
          transform: `translateX(-${activeSlide * 100}%)`,
        }}
      >
        {featuredGames.map((game) => (
          <GameSlide 
            key={game.id} 
            game={game} 
            theme={theme}
            handlePrevSlide={handlePrevSlide}
            handleNextSlide={handleNextSlide}
          />
        ))}
      </Box>

      {/* Dot indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          zIndex: 2,
        }}
      >
        {featuredGames.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => handleDotClick(idx)}
            sx={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: idx === activeSlide ? '#cccccc' : '#555555',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: idx === activeSlide ? '#ffffff' : '#777777',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HighlightsSection;
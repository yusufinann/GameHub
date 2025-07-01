import React, { useState } from 'react';
import { Box } from '@mui/material';

function GameCardImage({ game, priority = 'lazy', width = '25vw', height = '100%' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [gifSrc, setGifSrc] = useState(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!gifSrc) {
      setGifSrc(game.gif);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const loadingStrategy = priority === 'high' ? 'eager' : 'lazy';
  const fetchPriorityStrategy = priority === 'high' ? 'high' : 'auto';

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
        width: width,
        height: height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#333',
        }}
      >
        <Box
          component="img"
          src={game.image}
          alt={game.title}
          loading={loadingStrategy}
          fetchPriority={fetchPriorityStrategy}
          decoding="async"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isHovered ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
        {gifSrc && (
          <Box
            component="img"
            src={gifSrc}
            alt={`${game.title} animation`}
            width="100%"
            height="100%"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default GameCardImage;
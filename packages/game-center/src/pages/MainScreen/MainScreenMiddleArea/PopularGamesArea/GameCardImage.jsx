import React, { useState } from 'react';
import { Box } from '@mui/material';

function GameCardImage({ game }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-5px)',
        },
        width: '25vw',
        height:'100%',
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
        }}
      >
        <Box
          component="img"
          src={game.image}
          alt={game.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isHovered ? 'none' : 'block'
          }}
        />
        {isHovered && (
          <Box
            component="img"
            src={game.gif}
            alt={`${game.title} animation`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default GameCardImage;
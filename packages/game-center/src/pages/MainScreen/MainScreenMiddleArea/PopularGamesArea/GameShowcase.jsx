import { Box, Typography, IconButton, Paper, useTheme } from '@mui/material';
import React, { useState, useEffect } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import GamesIcon from '@mui/icons-material/Games';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarIcon from '@mui/icons-material/Star';

const GameShowcase = () => {
  const games = [
    { 
      id: 1, 
      title: 'Space Adventure', 
      rating: 4.8, 
      category: 'Action',
      imageUrl: 'https://images.unsplash.com/photo-1547025603-ef800f02690e?q=80&w=2100&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      color: '#4caf50' // Yeşil
    },
    { 
      id: 2, 
      title: 'Monster Hunter', 
      rating: 4.5, 
      category: 'RPG',
      imageUrl: 'https://wallpapercave.com/wp/wp10779455.jpg',
      color: '#2196f3' // Mavi  
    },
    { 
      id: 3, 
      title: 'Racing Legends', 
      rating: 4.2, 
      category: 'Sports',
      imageUrl: 'https://wallpapercave.com/uwp/uwp4701154.jpeg',
      color: '#ff9800' // Turuncu  
    },
    { 
      id: 4, 
      title: 'Zombie Survival', 
      rating: 4.7, 
      category: 'Horror',
      imageUrl: 'https://wallpapercave.com/wp/wp10779462.jpg',
      color: '#009688' // Turkuaz  
    },
    { 
      id: 5, 
      title: 'Treasure Island', 
      rating: 4.0, 
      category: 'Adventure',
      imageUrl: 'https://wallpapercave.com/wp/wp10779479.jpg',
      color: '#00bcd4' // Açık Turkuaz  
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % games.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [games.length]);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % games.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length);
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: theme.palette.background.app, 
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        
        height: '40vh'
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 0.5, 
          px: 1.5,
          backgroundColor: 'rgba(255,255,255,0.7)',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            color: '#333333', 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1.3rem' 
          }}
        >
          <GamesIcon sx={{ mr: 1, fontSize: '1.4rem', color: games[activeIndex].color }} /> Popular Games
        </Typography>
        <Box>
          <IconButton 
            onClick={handlePrev}
            sx={{ color: games[activeIndex].color, p: 0.5 }}
            size="small"
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={handleNext}
            sx={{ color: games[activeIndex].color, p: 0.5 }}
            size="small"
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 1.5,
          position: 'relative',
          background: theme.palette.background.gradient,
          height: '35vh'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
        
        <Box 
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            transition: 'transform 0.5s ease',
            transform: 'translateX(0%)',
            zIndex: 1
          }}
        >
          {games.map((game, index) => {
            const isActive = index === activeIndex;
            const isNext = (index === (activeIndex + 1) % games.length);
            const isPrev = (index === (activeIndex - 1 + games.length) % games.length);
            
            return (
              <Paper
                key={game.id}
                elevation={isActive ? 8 : 2}
                onMouseEnter={() => setHoveredCard(game.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  width: isActive ? '240px' : '170px',
                  height: isActive ? '190px' : '150px', 
                  margin: '0 8px',
                  display: isActive || isNext || isPrev ? 'flex' : 'none',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  transform: isActive ? 'scale(1)' : 'scale(0.85)',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'all 0.5s ease',
                  color: theme.palette.text.contrast,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  order: isActive ? 0 : (isNext ? 1 : -1),
                  zIndex: isActive ? 2 : 1,
                  background: theme.palette.background.card,
                  borderRadius: 2,
                  border: isActive ? `2px solid ${game.color}` : 'none', 
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${game.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(rgba(0,0,0,0.1), ${game.color}cc)`,
                    }
                  }}
                />
                
                <Box sx={{ zIndex: 1, position: 'relative', p: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      backgroundColor: theme.palette.background.offwhite,
                      color: game.color,
                      padding: '1px 6px',
                      borderRadius: 4,
                      display: 'inline-block',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  >
                    {game.category}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 0.5, 
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                      fontSize: '1rem'
                    }}
                  >
                    {game.title}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    zIndex: 1,
                    p: 1,
                    position: 'relative'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: theme.palette.background.offwhite,
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}>
                    <StarIcon sx={{ fontSize: 16, color: '#ff9800' }} />
                    <Typography variant="caption" sx={{ ml: 0.3, color: '#333', fontSize: '0.8rem' }}>
                      {game.rating}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: theme.palette.background.offwhite,
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    <SportsEsportsIcon sx={{ fontSize: 16, color: game.color }} />
                  </Box>
                </Box>
                
                {hoveredCard === game.id && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      background: `linear-gradient(transparent, ${game.color})`,
                      padding: 0.8,
                      transform: 'translateY(0)',
                      transition: 'transform 0.3s ease',
                      zIndex: 2
                    }}
                  >
                    <Typography 
                      align="center" 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: theme.palette.text.contrast,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem'
                      }}
                    >
                      <SportsEsportsIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      HEMEN OYNA
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: 0.5,
          backgroundColor: theme.palette.background.offwhite,
         
        }}
      >
        {games.map((game, index) => (
          <Box
            key={index}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              margin: '0 3px',
              backgroundColor: index === activeIndex ? game.color : '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default GameShowcase;
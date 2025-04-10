import { Box, Button, Typography, IconButton, useTheme} from '@mui/material';
import React, { useState, useRef } from 'react';
import { Gamepad, Star, Timer, ChevronLeft, ChevronRight, Construction, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../../../../utils/constants';

function ActiveGamesArea() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = 400;
    const targetScroll = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const isGameFullyImplemented = (gameId) => {
    // Only Bingo (id: 1) is fully implemented
    return gameId === 1;
  };

  const handleGameClick = (gameId) => {
    if (isGameFullyImplemented(gameId)) {
      // Navigate to the actual game
      navigate(`/game-detail/${gameId}`);
    } else {
      // For dummy games, navigate to the same page but show a preview/demo
      navigate(`/game-detail/${gameId}?preview=true`);
    }
  };

  return (
    <Box
      sx={{
        [theme.breakpoints.up('md')]: { width: '100%' },
        [theme.breakpoints.down('md')]: { width: '100%' },
        height: "50vh",
        background: 'transparent',
        marginTop: "20px",
        borderRadius: '25px',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
                      linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%)`,
          backgroundSize: '15px 15px',
          zIndex: 1
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 30,
        zIndex: 3,
        textAlign: 'left',
      }}>
        <Typography variant="h2" sx={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 800,
          background: 'linear-gradient(45deg, #ff6b6b 0%,rgb(78, 205, 133) 100%)',
          WebkitBackgroundClip: 'text',
          textShadow: '0 4px 6px rgba(0,0,0,0.2)',
          fontSize: '2.5rem',
          letterSpacing: '-1px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🎮</span>
          Game Paradise Awaits!
          <span>🚀</span>
        </Typography>
      </Box>

      <Box sx={{ 
        position: 'relative', 
        height: '40vh',
        mt: 10,
        width: '90%',
        zIndex: 2
      }}>
        {/* Navigation Arrows */}
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(5px)',
            '&:hover': { 
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#022b3a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>
        
        {/* Right Arrow */}
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(5px)',
            '&:hover': { 
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#022b3a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <ChevronRight fontSize="large" />
        </IconButton>

        {/* Scrollable Container */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { display: 'none' },
            height: '100%',
            padding: '0 40px',
            alignItems: 'center'
          }}
        >
          {GAMES.map((game, index) => {
            const fullyImplemented = isGameFullyImplemented(game.id);
            
            return (
              <Box
                key={game.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                sx={{
                  flex: '0 0 280px',
                  aspectRatio: '16/9',
                  position: 'relative',
                  borderRadius: '25px',
                  overflow: 'hidden',
                  height: '80%',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: hoveredIndex === index 
                    ? fullyImplemented ? '0 12px 32px rgba(78, 205, 196, 0.5)' : '0 12px 32px rgba(255, 180, 0, 0.5)'
                    : '0 6px 16px rgba(0, 0, 0, 0.2)',
                  border: '2px solid',
                  borderColor: hoveredIndex === index 
                    ? fullyImplemented ? '#4ECDC4' : '#FFB400' 
                    : 'transparent',
                  transform: hoveredIndex === index ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)'
                }}
              >
                {/* Game status badge for non-implemented games */}
                {!fullyImplemented && (
                  <Box sx={{
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    zIndex: 5,
                    backgroundColor: 'rgba(255, 123, 0, 0.85)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <Construction fontSize="small" />
                    <Typography variant="caption" fontWeight="bold">Preview Mode</Typography>
                  </Box>
                )}
              
                {/* Image Container */}
                <Box
                  component="img"
                  src={game.image}
                  alt={game.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    perspective: 1000,
                    filter: !fullyImplemented 
                      ? 'brightness(0.85)' 
                      : hoveredIndex === index 
                        ? 'brightness(1.1)' 
                        : 'brightness(0.9)',
                    transition: 'transform 0.4s ease-out, filter 0.3s ease',
                    transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                
                {/* Game highlight for Bingo */}
                {fullyImplemented && (
                  <Box sx={{
                    position: 'absolute',
                    top: 15,
                    left: 15,
                    zIndex: 5,
                    backgroundColor: 'rgba(38, 166, 154, 0.85)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <EmojiEvents fontSize="small" />
                    <Typography variant="caption" fontWeight="bold">FULLY READY!</Typography>
                  </Box>
                )}
                
                {/* Content Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
                    backdropFilter: 'blur(2px)',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    color: '#fff', 
                    mb: 1, 
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {game.title}
                  </Typography>
                  
                  {/* Game Info Icons */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    '& > *': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                    }
                  }}>
                    <Box>
                      <Gamepad sx={{ color: '#4ECDC4', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500 }}>
                        {game.genre}
                      </Typography>
                    </Box>
                    <Box>
                      <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500 }}>
                        {game.rating}
                      </Typography>
                    </Box>
                    <Box>
                      <Timer sx={{ color: '#FF6B6B', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500 }}>
                        {game.playTime}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Play Button - Now all are active */}
                  <Button
                    variant="contained"
                    onClick={() => handleGameClick(game.id)}
                    fullWidth
                    sx={{
                      bgcolor: fullyImplemented ? 'rgba(38, 166, 154, 0.85)' : 'rgba(255, 180, 0, 0.85)',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      padding: '10px 0',
                      transition: 'all 0.3s ease',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      '&:hover': { 
                        bgcolor: fullyImplemented ? 'rgba(38, 166, 154, 1)' : 'rgba(255, 180, 0, 1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                      }
                    }}
                  >
                    {fullyImplemented ? 'Play Now' : 'Try Preview'}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default ActiveGamesArea;
import { Box, Button, Typography, IconButton, useTheme, keyframes } from '@mui/material';
import React, { useState, useRef } from 'react';
import { Gamepad, Star, Timer, ChevronLeft, ChevronRight } from '@mui/icons-material';
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
  const floatAnimation = keyframes`
  0%, 100% { transform: translate3d(-50%, 0, 0); }
  50% { transform: translate3d(-50%, -8px, 0); }
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

  return (
    <Box
      sx={{
        [theme.breakpoints.up('md')]: { width: '30%' },
        [theme.breakpoints.down('md')]: { width: '100%' },
        background: 'linear-gradient(135deg,rgb(135, 243, 165) 0%,rgb(31, 210, 82) 100%)',
        borderRadius: '25px',
        position: 'relative',
        overflow: 'hidden',
        justifyContent:'center',
        alignItems:'center',
        display:'flex',
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
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        textAlign: 'center',
        //animation: `${floatAnimation} 3s ease-in-out infinite`
      }}>
       <Typography variant="h2" sx={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 800,
          background: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 6px rgba(0,0,0,0.2)',
          fontSize: '2.5rem',
          letterSpacing: '-1px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          '&::before': {
            content: '"🎮"',
            fontSize: '1.5em',
            //animation: `${spinAnimation} 5s linear infinite`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          },
          '&::after': {
            content: '"🚀"',
            //animation: `${bounceAnimation} 2s ease-in-out infinite`
          }
        }}>
          Let's Play!
        </Typography>
      </Box>
      <Box sx={{ 
        position: 'relative', 
        height: '30vh',
        mt: 8,
        width: '90%',
        zIndex: 2
      }}>
        {/* Navigation Arrows - Updated Style */}
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            '&:hover': { 
              bgcolor: 'rgba(255, 255, 255, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#022b3a'
          }}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>
        
        {/* Right Arrow - Mirror of left arrow */}
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(5px)',
            '&:hover': { 
              bgcolor: 'rgba(255, 255, 255, 0.5)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#022b3a'
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
          {GAMES.map((game, index) => (
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
                height: '90%',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hoveredIndex === index 
                  ? '0 8px 32px rgba(78, 205, 196, 0.4)' 
                  : '0 4px 16px rgba(0, 0, 0, 0.2)',
                border: '2px solid',
                borderColor: hoveredIndex === index ? '#4ECDC4' : 'transparent'
              }}
            >
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
                  filter: hoveredIndex === index ? 'brightness(1.1)' : 'brightness(0.9)'
                }}
              />
              
              {/* Content Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '20px',
                  //background: 'linear-gradient(to top, rgba(2,43,58,0.9) 0%, rgba(2,43,58,0.4) 100%)',
                 // backdropFilter: 'blur(4px)'
                }}
              >
                <Typography variant="h6" sx={{ 
                  color: '#fff', 
                  mb: 1, 
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
                    gap: 1
                  }
                }}>
                  <Box>
                    <Gamepad sx={{ color: '#4ECDC4', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {game.genre}
                    </Typography>
                  </Box>
                  <Box>
                    <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {game.rating}
                    </Typography>
                  </Box>
                  <Box>
                    <Timer sx={{ color: '#FF6B6B', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: '#fff' }}>
                      {game.playTime}
                    </Typography>
                  </Box>
                </Box>

                {/* Play Button */}
                <Button
                  variant="contained"
                  onClick={() => navigate(`/game-detail/${game.id}`)}
                  fullWidth
                  sx={{
                    bgcolor: 'rgba(214, 207, 207, 0.49)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '10px 0',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'rgba(46, 45, 45, 0.49)',
                      
                    }
                  }}
                >
                  Play Now
                </Button>
          
              </Box>
            </Box>
            
          ))}
        </Box>
        
      </Box>
    
    </Box>
  );
}

export default ActiveGamesArea;
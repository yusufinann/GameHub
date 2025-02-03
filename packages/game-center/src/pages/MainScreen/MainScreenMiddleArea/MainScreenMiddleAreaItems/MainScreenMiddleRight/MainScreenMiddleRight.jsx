import { Box, Button, Typography, Grid, Container, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Gamepad, Star, Timer } from '@mui/icons-material';

const games = [
  {
    title: "Adventure Quest",
    image: 'https://eddra.com/edadmin/uploads/image/online-takim-aktiviteleri/online-tombala/2-550x400.jpg',
    genre: "Adventure",
    rating: 4.5,
    playTime: "20min"
  },
  {
    title: "Space Explorer",
    image: 'https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Funo%2Fhome%2FGameName_Store_Landscape_2560x1440-2560x1440-5195e8a3e06d672f97a1ee49ecea59027c14cae4.jpg',
    genre: "Sci-Fi",
    rating: 4.8,
    playTime: "15min"
  },
  {
    title: "Magic Realm",
    image: 'https://www.shutterstock.com/shutterstock/photos/1258437028/display_1500/stock-photo-logic-chess-game-logo-simple-illustration-of-logic-chess-game-logo-for-web-design-isolated-on-1258437028.jpg',
    genre: "Fantasy",
    rating: 4.2,
    playTime: "25min"
  },
  {
    title: "Speed Racing",
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ63bZ9-d9KLHmXM7kXcxhBTIG--ZPlT64tcQ&s',
    genre: "Racing",
    rating: 4.6,
    playTime: "10min"
  },
];

function MainScreenMiddleRight() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const theme=useTheme();
  return (
    <Box
      sx={{
        [theme.breakpoints.up('md')]: {
          width: '40%',
        },
        [theme.breakpoints.down('md')]: {
          width: '100%',
        },
        height: '60vh',
        background: 'linear-gradient(135deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)',
        borderRadius: '25px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        position: 'relative',
        padding: '20px',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: 'black',
          mb: 3,
          textAlign: 'center',
          fontWeight: 600,
          position: 'relative',
        }}
      >
        Featured Games
      </Typography>

      <Container sx={{ height: 'calc(100% - 60px)', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Grid container spacing={2}>
          {games.map((game, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                sx={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  height: '200px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    //background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                    zIndex: 1,
                  }
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
                    transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                />
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    zIndex: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                    {game.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Gamepad sx={{ color: '#4ECDC4', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#fff' }}>
                        {game.genre}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: '#FFD700', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#fff' }}>
                        {game.rating}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Timer sx={{ color: '#FF6B6B', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: '#fff' }}>
                        {game.playTime}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      //background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4)',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'rgba(35, 35, 33, 0.1)',
                        
                      },
                    }}
                  >
                    Play Now
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default MainScreenMiddleRight;
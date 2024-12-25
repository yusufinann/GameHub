import { Box, Button, Card, CardMedia } from '@mui/material';
import React from 'react';

const games = [
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
];

function MainScreenRight() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '20%',
        height:'80vh',
        background: 'linear-gradient(145deg, #F9F9F9 0%, #FFFFFF 100%)',
        borderRadius: '15px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
        padding: { xs: '15px', sm: '20px' },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '10px',
          width: '100%',
        }}
      >
        {games.map((game, index) => (
          <Card
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              padding: '10px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <CardMedia
              component="img"
              image={game.image}
              alt="Game Image"
              sx={{
                width: '90%',
                height: 'auto',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            />
            <Button
              sx={{
                width: '80%',
                background: 'linear-gradient(145deg, #FFB74D 0%, #FF9800 100%)',
                color: '#FFF',
                fontWeight: 'bold',
                borderRadius: '20px',
                padding: '5px 10px',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                boxShadow: '0 4px 10px rgba(255, 152, 0, 0.3)',
                transition: 'background 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(145deg, #FF9800 0%, #F57C00 100%)',
                },
              }}
            >
              Play
            </Button>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default MainScreenRight;

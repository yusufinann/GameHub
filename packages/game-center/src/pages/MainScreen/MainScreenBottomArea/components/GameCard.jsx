import React from 'react';
import { Box, Button} from '@mui/material';

const GameCard = ({ title, thumbnail, openGiveawayUrl }) => (
  <Box
    sx={{
      width: '100%', // Konteynerin tam genişliğini kapla
      height: '30vh', // Yüksekliği sabit tut
      backgroundImage: `url(${thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'scale(1.03)', // Daha küçük hover efekti
        boxShadow: '0 12px 24px rgba(14, 153, 69, 0.5)',
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        '&:hover': {
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))',
        },
       // background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8))',
      }}
    />
   
    <Button
      variant="contained"
      sx={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: "#2E7D32",
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderRadius: '20px',
        padding: '6px 12px',
        zIndex: 2,
        '&:hover': {
          backgroundColor: '#81C784',
        },
      }}
      onClick={() => window.open(openGiveawayUrl, '_blank')}
    >
      Play Now
    </Button>
  </Box>
);

export default GameCard;
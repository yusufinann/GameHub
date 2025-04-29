import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const Header = ({ title, icon,theme}) => (
  <Box
    sx={{
      background: 'transparent',
      borderRadius: '15px',
      p: 3,
      mb: 4,
      mt: 4,
      transition: 'transform 0.3s ease',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {React.cloneElement(icon, {
          sx: {
            fontSize: '42px',
            color: '#ff6347',
            mr: 2,
            filter: 'drop-shadow(0 0 5px rgba(255, 107, 107, 0.5))',
            '&:hover': {
              transform: 'rotate(360deg)',
              transition: 'transform 0.8s ease'
            }
          }
        })}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            background:theme.palette.text.title,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '2px 2px 4px rgba(234, 26, 26, 0.3)',
            fontFamily: '"Bebas Neue", cursive'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#ff6347',
            boxShadow: '0 0 10px rgba(255, 99, 71, 0.7)'
          }}
        />
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#ff8e53',
            boxShadow: '0 0 10px rgba(255, 142, 83, 0.7)'
          }}
        />
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff8e53, #ff6347)',
            boxShadow: '0 0 15px rgba(255, 142, 83, 0.7)'
          }}
        />
      </Box>
    </Box>
    <Divider 
      sx={{
        mt: 2,
        border: 'none',
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #ff6b6b 50%, transparent 100%)',
        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
      }}
    />
  </Box>
);

export default Header;
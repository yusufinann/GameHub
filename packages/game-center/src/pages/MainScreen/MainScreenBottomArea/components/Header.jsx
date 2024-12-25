import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const Header = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
    }}
  >
    <SportsEsportsIcon sx={{ fontSize: '32px', color: '#ff6347', marginRight: '10px' }} />
    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', marginRight: '10px' }}>
      Games
    </Typography>
    <Divider
      sx={{
        flexGrow: 1,
        height: '2px',
        backgroundColor: '#ccc',
        margin: '10px',
      }}
    />
  </Box>
);

export default Header;

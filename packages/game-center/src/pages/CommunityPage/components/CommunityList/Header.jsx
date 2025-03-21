// GlobalCommunity.jsx
import React from 'react';
import { Box, Typography, ListItemButton, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { Public as PublicIcon } from '@mui/icons-material';
import { keyframes } from '@mui/material/styles';

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const GlowingIndicator = () => (
  <Box
    sx={{
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: '#1976d2',
      animation: `${pulseAnimation} 2s infinite`,
      display: 'inline-block',
      mr: 1
    }}
  />
);

const Header = ({ activeItem, handleSelectCommunity }) => {
  return (
    <>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Communities
        </Typography>
      </Box>
      {/* Global Community List Item */}
      <ListItemButton
        onClick={() => handleSelectCommunity('global')}
        selected={activeItem === 'global'}
        sx={{
          py: 1.5,
          backgroundColor: activeItem === 'global' ? 'rgba(253, 89, 89, 0.1)' : 'transparent',
          '&:hover': { backgroundColor: 'rgba(253, 89, 89, 0.05)' }
        }}
      >
        <ListItemIcon>
          <Avatar sx={{ bgcolor: '#fd5959' }}>
            <PublicIcon />
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary="Global Community"
          secondary="All members"
          primaryTypographyProps={{ fontWeight: activeItem === 'global' ? 'bold' : 'normal' }}
        />
        <GlowingIndicator />
      </ListItemButton>
    </>
  );
};

export default Header;

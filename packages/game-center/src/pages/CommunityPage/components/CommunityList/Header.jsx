import React from 'react';
import { Box, Typography, ListItemButton, ListItemIcon, ListItemText, Avatar, useTheme } from '@mui/material';
import { Public as PublicIcon } from '@mui/icons-material';
import { keyframes } from '@mui/material/styles';

const createPulseAnimation = (mainColor) => keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(${mainColor}, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(${mainColor}, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(${mainColor}, 0);
  }
`;

const GlowingIndicator = () => {
  const theme = useTheme();
  const mainColor = theme.palette.secondary.main.replace('#', '');
  const rgb = parseInt(mainColor, 16);  
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  return (
    <Box
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: theme.palette.secondary.main,
        animation: `${createPulseAnimation(`${r},${g},${b}`)} 2s infinite`,
        display: 'inline-block',
        mr: 1
      }}
    />
  );
};

const Header = ({ activeItem, handleSelectCommunity }) => {
  const theme = useTheme();

  return (
    <>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}
        >
          Communities
        </Typography>
      </Box>

      {/* Global Community List Item */}
      <ListItemButton
        onClick={() => handleSelectCommunity('global')}
        selected={activeItem === 'global'}
        sx={{
          py: 1.5,
          backgroundColor: activeItem === 'global' 
            ? theme.palette.mode === 'light'
              ? 'rgba(38, 166, 154, 0.12)'
              : 'rgba(101, 147, 245, 0.15)'
            : 'transparent',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'light'
              ? 'rgba(38, 166, 154, 0.08)'
              : 'rgba(101, 147, 245, 0.1)'
          }
        }}
      >
        <ListItemIcon>
          <Avatar sx={{ 
            bgcolor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText
          }}>
            <PublicIcon />
          </Avatar>
        </ListItemIcon>
        <ListItemText
          primary="Global Community"
          secondary="All members"
          primaryTypographyProps={{ 
            fontWeight: activeItem === 'global' ? 'bold' : 'normal',
            color: theme.palette.text.primary
          }}
          secondaryTypographyProps={{
            color: theme.palette.text.secondary
          }}
        />
        <GlowingIndicator />
      </ListItemButton>
    </>
  );
};

export default Header;
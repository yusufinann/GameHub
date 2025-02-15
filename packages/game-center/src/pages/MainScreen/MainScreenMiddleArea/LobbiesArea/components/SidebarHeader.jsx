import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const SidebarHeader = ({ isOpen, toggleSidebar }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px',
      backgroundColor: '#F5F5F5',
      borderRadius: '15px',
    }}
  >
    {isOpen && (
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        Lobbies
      </Typography>
    )}
    <IconButton onClick={toggleSidebar}>
      {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </IconButton>
  </Box>
);
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
      borderBottom: '1px solid #ccc',
      backgroundColor: '#F5F5F5',
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
        Chat Rooms
      </Typography>
    )}
    <IconButton onClick={toggleSidebar}>
      {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </IconButton>
  </Box>
);
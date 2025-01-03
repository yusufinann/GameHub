import React from 'react';
import { ListItem, ListItemText, Avatar, Tooltip } from '@mui/material';

export const TabItem = ({ tab, isOpen, selectedTab, onTabChange }) => (
  <Tooltip title={tab.label} placement="right" arrow>
    <ListItem
      button
      selected={selectedTab === tab.value}
      onClick={() => onTabChange(tab.value)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: selectedTab === tab.value ? '#E0E0E0' : '#FFF',
        '&:hover': {
          backgroundColor: '#D3D3D3',
        },
      }}
    >
      <Avatar>{tab.icon}</Avatar>
      {isOpen && (
        <ListItemText
          primary={tab.label}
          primaryTypographyProps={{
            fontWeight: '500',
          }}
        />
      )}
    </ListItem>
  </Tooltip>
);

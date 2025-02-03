import React from 'react';
import { Box } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LockIcon from '@mui/icons-material/Lock';
import EventIcon from '@mui/icons-material/Event';
import { ListItem, ListItemText, Avatar, Tooltip } from '@mui/material';

// TabItem bileşeni
const TabItem = ({ tab, isOpen, selectedTab, onTabChange }) => (
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

function  TabList  ({ isOpen, selectedTab, onTabChange })  {
  const tabs = [
    { label: 'All', value: 'all', icon: <ListAltIcon /> },
    { label: 'Private', value: 'private', icon: <LockIcon /> },
    { label: 'Event', value: 'event', icon: <EventIcon /> },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px',
      }}
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.value}
          tab={tab}
          isOpen={isOpen}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
        />
      ))}
    </Box>
  );
};
export default TabList;
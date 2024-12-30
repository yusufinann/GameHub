import React from 'react';
import { Box } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LockIcon from '@mui/icons-material/Lock';
import EventIcon from '@mui/icons-material/Event';
import { TabItem } from './TabItem';

export const TabList = ({ isOpen, selectedTab, onTabChange }) => {
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
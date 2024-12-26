import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import LockIcon from '@mui/icons-material/Lock';
import ListAltIcon from '@mui/icons-material/ListAlt';

function RoomsSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const isSmallScreen = useMediaQuery('(max-width: 1000px)');

  useEffect(() => {
    if (isSmallScreen) {
      setIsOpen(false);
    }
  }, [isSmallScreen]);

  const toggleSidebar = () => {
    setIsOpen((prevState) => {
      if (prevState) {
        setSelectedTab('all');
      }
      return !prevState;
    });
  };

  const handleTabChange = (newValue) => setSelectedTab(newValue);

  const colors = {
    private: '#FFD700',
    event: '#FF69B4',
    default: '#87CEEB',
  };

  const rooms = [
    { id: 1, name: 'Private Room 1', type: 'private', description: 'Play private game' },
    { id: 2, name: 'Private Room 2', type: 'private', description: 'Private game' },
    { id: 3, name: 'Event Room 1', type: 'event', description: 'Lets event' },
    { id: 4, name: 'Event Room 2', type: 'event', description: 'Play event game with us' },
  ];

  const filteredRooms = selectedTab === 'all'
    ? rooms
    : rooms.filter((room) => room.type === selectedTab);

  const tabs = [
    { label: 'All', value: 'all', icon: <ListAltIcon /> },
    { label: 'Private', value: 'private', icon: <LockIcon /> },
    { label: 'Event', value: 'event', icon: <EventIcon /> },
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#FFF',
        margin: '10px',
        position: 'relative',
        height: '100%',
        width: isOpen ? '15vw' : '50px',
        transition: 'width 0.3s ease',
        borderRadius: '15px',
        overflow: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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

      {isOpen && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px',
          }}
        >
          {tabs.map((tab) => (
            <Tooltip key={tab.value} title={tab.label} placement="right" arrow>
              <ListItem
                button
                selected={selectedTab === tab.value}
                onClick={() => handleTabChange(tab.value)}
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
          ))}
        </Box>
      )}

      <Box
        sx={{
          padding: '5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {filteredRooms.map((room) => (
          <Tooltip key={room.id} title={room.description} arrow placement="right">
            <ListItem
              button
              sx={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: isOpen ? colors[room.type] : '#FFF',
                color: isOpen ? '#FFF' : '#333',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: isOpen ? '#333' : colors.default,
                  color: '#FFF',
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: colors[room.type],
                  width: 40,
                  height: 40,
                  fontSize: 18,
                }}
              >
                {room.type === 'private' ? <LockIcon /> : <EventIcon />}
              </Avatar>
              {isOpen && (
                <ListItemText
                  primary={room.name}
                  primaryTypographyProps={{
                    fontWeight: '500',
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

export default RoomsSidebar;

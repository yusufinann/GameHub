import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  ListItem,
  ListItemText,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  useMediaQuery,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';
import LockIcon from '@mui/icons-material/Lock';

function RoomsSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const isSmallScreen = useMediaQuery('(max-width: 1000px)');

  useEffect(() => {
    // Küçük ekranlarda yan paneli otomatik olarak kapalı yap
    if (isSmallScreen) {
      setIsOpen(false);
    }
  }, [isSmallScreen]);

  const toggleSidebar = () => {
    setIsOpen((prevState) => {
      // Yan panel kapandığında "All" sekmesini seçili yap
      if (prevState) {
        setSelectedTab('all');
      }
      return !prevState;
    });
  };

  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  const colors = {
    private: '#FFD700', // Altın rengi
    event: '#FF69B4', // Pembe
    default: '#87CEEB', // Açık mavi
  };

  const rooms = [
    { id: 1, name: 'Private Room 1', type: 'private', description: 'Confidential discussions.' },
    { id: 2, name: 'Private Room 2', type: 'private', description: 'Personal space.' },
    { id: 3, name: 'Event Room 1', type: 'event', description: 'Upcoming event discussions.' },
    { id: 4, name: 'Event Room 2', type: 'event', description: 'Live event planning.' },
  ];

  const filteredRooms = selectedTab === 'all'
    ? rooms
    : rooms.filter((room) => room.type === selectedTab);

  return (
    <Box
      sx={{
        backgroundColor: '#FFF',
        margin: '10px',
        position: 'relative',
        height: '100%',
        width: isOpen ? '20vw' : '50px',
        transition: 'width 0.3s ease',
        borderRadius: '15px',
        overflow: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
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
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          sx={{
            backgroundColor: '#E0E0E0',
            borderBottom: '1px solid #ccc',
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Private" value="private" />
          <Tab label="Event" value="event" />
        </Tabs>
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
                justifyContent:"center",
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

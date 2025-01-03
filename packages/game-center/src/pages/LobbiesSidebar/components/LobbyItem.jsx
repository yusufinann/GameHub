import React from 'react';
import { ListItem, Avatar, Tooltip, IconButton, Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLobbyContext } from '../../MainScreen/MainScreenMiddleArea/LobbyContext';
import { useLobbyDeletion } from '../hooks/useLobbyDeletion';
import { useState, useEffect } from 'react';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getEventTimeInfo = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime) return null;

  const eventDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const now = new Date();
  
  if (isNaN(eventDateTime.getTime())) return null;
  
  const difference = eventDateTime - now;
  
  // If event has ended
  if (endDateTime < now) return null;

  // If event has started but not ended
  if (difference < 0 && now < endDateTime) {
    return 'The event continues';
  }
  
  // If more than 24 hours remaining, show start date
  if (difference > 24 * 60 * 60 * 1000) {
    return formatDate(startDate);
  }
  
  // Less than 24 hours remaining, show hours remaining
  const hours = Math.floor(difference / (1000 * 60 * 60));
  return `${hours} to the event`;
};
export const LobbyItem = ({ lobby, isOpen, colors }) => {
  const { existingLobby } = useLobbyContext();
  const { handleDelete } = useLobbyDeletion();
  const [timeInfo, setTimeInfo] = useState('');

  useEffect(() => {
    if (lobby.eventType === 'event') {
      const updateTime = () => {
        const info = getEventTimeInfo(lobby.startDate, lobby.startTime, lobby.endDate, lobby.endTime);
        setTimeInfo(info);
      };
      
      updateTime();
      const timer = setInterval(updateTime, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [lobby]);

  // Don't render if the event has ended
  if (lobby.eventType === 'event' && !timeInfo) {
    return null;
  }

  if (!lobby) {
    console.error('Lobby data is undefined or null.');
    return null;
  }

  const getIcon = () => {
    switch (lobby.eventType) {
      case 'private':
        return <LockIcon />;
      case 'event':
        return <EventIcon />;
      default:
        return <GroupIcon />;
    }
  };

  const getBackgroundColor = () => {
    return colors[lobby.eventType] || colors.default || '#ccc';
  };

  return (
    <Tooltip
      title={isOpen ? '' : `${lobby.lobbyName || 'Unnamed Lobby'} (${lobby.eventType || 'unknown'})`}
      arrow
      placement="right"
    >
      <ListItem
        button
        sx={{
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          gap: '12px',
          backgroundColor: isOpen ? getBackgroundColor() : '#FFF',
          color: isOpen ? '#FFF' : '#333',
          transition: 'all 0.3s ease',
          padding: isOpen ? '8px 16px' : '8px',
          '&:hover': {
            backgroundColor: isOpen ? `${getBackgroundColor()}dd` : colors.default,
            color: '#FFF',
          },
        }}
      >
        <Avatar
          sx={{
            bgcolor: getBackgroundColor(),
            width: 40,
            height: 40,
            fontSize: 18,
          }}
        >
          {getIcon()}
        </Avatar>

        {isOpen && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">
              {lobby.lobbyName || 'Unnamed Lobby'}
            </Typography>
            {lobby.eventType === 'event' && timeInfo && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.75rem'
                }}
              >
                {timeInfo}
              </Typography>
            )}
          </Box>
        )}

        {isOpen && lobby.lobbyCode === existingLobby?.lobbyCode && (
          <IconButton
            onClick={(e) => handleDelete(lobby.lobbyCode, e)}
            size="small"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
    </Tooltip>
  );
};
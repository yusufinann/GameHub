import React from 'react';
import { ListItem, ListItemText, Avatar, Tooltip, Box, Typography, IconButton } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { useLobbyContext } from '../../MainScreen/MainScreenMiddleArea/LobbyContext';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLobbyDeletion } from '../hooks/useLobbyDeletion';
export const RoomItem = ({ lobby, isOpen, colors }) => {
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

  const {existingLobby } = useLobbyContext();
  const navigate = useNavigate();
  const { handleDelete } = useLobbyDeletion();
  // const handleDelete = async (e) => {
  //   e.stopPropagation(); // Prevent item click event
  //   try {
  //     await deleteLobby(lobby.lobbyCode);
  //     navigate('/');
  //   } catch (error) {
  //     console.error('Error deleting lobby:', error);
  //   }
  // };
  const getBackgroundColor = () => {
    return colors[lobby.eventType] || colors.default;
  };

  return (
    <Tooltip 
      title={isOpen ? '' : `${lobby.lobbyName} (${lobby.eventType})`} 
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

        {isOpen && lobby.lobbyCode === existingLobby?.lobbyCode && (
          <IconButton
          onClick={(e) => handleDelete(lobby.lobbyCode, e)}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              color: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
    </Tooltip>
  );
};
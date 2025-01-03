import React from 'react';
import { ListItem, Avatar, ListItemText, Tooltip } from '@mui/material';
import { Person as PersonIcon, Settings as SettingsIcon } from '@mui/icons-material';

function MemberItem({ member }) {
  return (
    <ListItem
      sx={{
        mb: 0.5,
        bgcolor: member.isHost ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
        borderRadius: '10px',
        '&:hover': {
          bgcolor: 'rgba(25, 118, 210, 0.2)',
        },
      }}
      secondaryAction={
        member.isHost && (
          <Tooltip title="Host">
            <SettingsIcon sx={{ color: '#1a237e', fontSize: '1rem' }} />
          </Tooltip>
        )
      }
    >
      <Avatar
        sx={{
          width: 30,
          height: 30,
          fontSize: '0.9rem',
          bgcolor: member.isHost ? '#1a237e' : '#2196f3',
        }}
      >
        <PersonIcon fontSize="small" />
      </Avatar>
      <ListItemText
        primary={member.name}
        primaryTypographyProps={{
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: '#1a237e',
        }}
      />
    </ListItem>
  );
}

export default MemberItem;

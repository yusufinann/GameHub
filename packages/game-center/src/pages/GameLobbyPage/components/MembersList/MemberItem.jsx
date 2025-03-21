import React from 'react';
import { ListItem, Avatar, ListItemText, Typography, Box } from '@mui/material';

function MemberItem({ member, index }) {
  return (
    <ListItem
      sx={{
        mb: 0.5,
        bgcolor: member.isHost ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
        borderRadius: '10px',
        '&:hover': {
          bgcolor: member.isHost ? 'rgba(255, 215, 0, 0.3)' : 'rgba(25, 118, 210, 0.2)',
        },
        position: 'relative',
      }}
    >
      <Avatar
        src={member.avatar || undefined}
        sx={{
          width: 50, // boyutu büyüttük
          height: 50,
          fontSize: '1rem', // font boyutunu da orantılı hale getirebilirsiniz
          bgcolor: member.isHost ? '#ffb300' : '#2196f3',
          border: member.isHost ? '2px solid gold' : 'none',
          boxShadow: member.isHost ? '0 0 8px rgba(255, 215, 0, 0.6)' : 'none',
        }}
      >
        { !member.avatar ? (member.name?.[0] || `P${index + 1}`) : null }
      </Avatar>

      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#1a237e',
              }}
            >
              {member.name || `Player ${index + 1}`}
            </Typography>
            {member.isHost && (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: 'gold',
                  bgcolor: 'rgba(255, 215, 0, 0.2)',
                  px: 1,
                  py: 0.3,
                  borderRadius: '5px',
                }}
              >
                Host
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
}

export default MemberItem;

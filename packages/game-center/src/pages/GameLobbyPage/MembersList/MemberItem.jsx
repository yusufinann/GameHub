import React from 'react';
import { ListItem, Avatar, ListItemText, Typography, Box, useTheme } from '@mui/material';

function MemberItem({ member, index,t }) {
  const theme = useTheme();

  return (
    <ListItem
      sx={{
        mb: 0.5,
        bgcolor: member.isHost 
          ? `${theme.palette.secondary.gold}26` // 15% opacity (26 in hex)
          : 'transparent',
        borderRadius: '10px',
        '&:hover': {
          bgcolor: member.isHost 
            ? `${theme.palette.secondary.gold}4D` // 30% opacity (4D in hex)
            : `${theme.palette.secondary.main}33`, // 20% opacity (33 in hex)
        },
        position: 'relative',
      }}
    >
      <Avatar
        src={member.avatar || undefined}
        sx={{
          width: 50, 
          height: 50,
          fontSize: '1rem', 
          bgcolor: member.isHost 
            ? theme.palette.secondary.gold 
            : theme.palette.secondary.main,
          border: member.isHost 
            ? `2px solid ${theme.palette.secondary.gold}` 
            : 'none',
          boxShadow: member.isHost 
            ? `0 0 8px ${theme.palette.secondary.gold}99` 
            : 'none',
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
                color: theme.palette.text.primary,
              }}
            >
              {member.name || `Player ${index + 1}`}
            </Typography>
            {member.isHost && (
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: theme.palette.secondary.gold,
                  bgcolor: `${theme.palette.secondary.gold}33`, 
                  px: 1,
                  py: 0.3,
                  borderRadius: '5px',
                }}
              >
                {t("Host")}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
}

export default MemberItem;
// ActiveLobbies.js
import React from 'react';
import { Card, CardContent, Typography, List,useTheme } from '@mui/material';
import { People } from '@mui/icons-material';
import NoActiveLobbies from './NoActiveLobbies';
import LobbyItem from '../../../../shared/LobbyItem/LobbyItem';

function ActiveLobbies({filteredLobbies}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: theme.shadows[8],
        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        overflow: 'hidden',
        p: 2,
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[12],
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.common.white,
          }}
        >
          <People sx={{ mr: 1 }} />
          Active Lobbies
        </Typography>
        <List>
          {filteredLobbies.length > 0 ? (
            filteredLobbies.map((lobby) => (
              <LobbyItem key={lobby.id || lobby.lobbyCode} lobby={lobby} isOpen={true} />
            ))
          ) : (
            <NoActiveLobbies/>
          )}
        </List>
      </CardContent>
    </Card>
  );
}

export default ActiveLobbies;

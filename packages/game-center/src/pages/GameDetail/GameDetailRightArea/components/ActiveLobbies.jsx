// ActiveLobbies.js
import React from 'react';
import { Card, CardContent, Typography, List,useTheme, Box } from '@mui/material';
import { People } from '@mui/icons-material';
import NoActiveLobbies from './NoActiveLobbies';
import LobbyItem from '../../../../shared/components/LobbyItem/LobbyItem';

function ActiveLobbies({filteredLobbies}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: theme.shadows[8],
        backgroundColor: "rgb(50,135,97)",
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[12],
        },
      }}
    ><Box sx={{ background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)"}}>   <CardContent>
        <Typography
          variant="h6"
          sx={{
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
      </Box>
   
    </Card>
  );
}

export default ActiveLobbies;

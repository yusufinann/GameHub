import React from 'react';
import { Box,useTheme } from '@mui/material';
import { LobbyList } from './components/LobbyList';
import { useLobbyContext } from '../context';


function LobbiesArea (){
  const { lobbies } = useLobbyContext();
  const theme=useTheme();


  return (
    <Box
      sx={{
        [theme.breakpoints.up('md')]: {
          width: '100%', },
        [theme.breakpoints.down('md')]: { width: '100%' },
        position: 'relative',
        height: '65vh',
        transition: 'width 0.3s ease',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LobbyList lobbies={lobbies}/>
    </Box>
  );
};

export default LobbiesArea;
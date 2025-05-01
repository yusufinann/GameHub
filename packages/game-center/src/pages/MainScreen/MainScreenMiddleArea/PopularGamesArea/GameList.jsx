import React from 'react';
import { Box } from '@mui/material';
import { gameData } from '../../../../utils/constants';
import GameCardImage from './GameCardImage'; 

function GameList() {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: {xs:'column', md:'row'},
      alignItems: 'center',
      gap: 3,
      overflowX: 'auto',
    }}>
      {gameData.map((game) => (
        <GameCardImage
          key={game.id}
          game={game}
        />
      ))}
    </Box>
  );
}

export default GameList;
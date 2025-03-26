import React from 'react';
import { Box } from '@mui/material';
import { gameData } from '../../../../utils/constants';
import GameCardImage from './GameCardImage'; // We'll create this component next

function GameList() {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
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
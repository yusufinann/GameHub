import React from 'react'
import {Box} from '@mui/material';
 import GameInfo from './components/GameInfo';
import GameHistory from './components/GameHistory';
function GameDetailLeftArea({colorScheme,game,filteredLobbies}) {
  return (
       <Box sx={{flex: '1 1 600px', minWidth: 0 }}>
        <GameInfo colorScheme={colorScheme} game={game} filteredLobbies={filteredLobbies}/>
        <GameHistory colorScheme={colorScheme} />
     </Box>
  )
}

export default GameDetailLeftArea
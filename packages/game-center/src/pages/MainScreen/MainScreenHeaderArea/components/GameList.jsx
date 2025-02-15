
import { 
  Box, 
  Stack,
} from '@mui/material';
import { gameData } from '../../../../utils/constants'
import StyledGameCard from '../components/StyledGameCard';
function GameList({isMediumScreen,selectedGame,setSelectedGame,theme}) {
  return (
    <Box sx={{ 
        width: isMediumScreen ? '100%' : 300,
        flexShrink: 0,
        zIndex: 2,
        overflowY: 'auto',
      }}>
        <Stack spacing={2} sx={{ height: '80%' }}>
          {gameData.map((game) => (
            <StyledGameCard
              key={game.id}
              game={game}
              isSelected={selectedGame.id === game.id}
              onClick={() => setSelectedGame(game)}
              theme={theme}
            />
          ))}
        </Stack>
      </Box>
  )
}

export default GameList
import React from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Avatar,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PeopleIcon from '@mui/icons-material/People';
const GameInfo = React.memo(({ selectedGame, theme }) => {
  return (
    <Box sx={{ 
        flex: 1,
        minWidth: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Stack spacing={3}>
          <Box>
            <Chip
              label={selectedGame.genre}
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="h4" sx={{ 
              color: 'common.white', 
              fontWeight: 'bold',
              fontSize: { xs: '1.75rem', sm: '2.5rem' }
            }}>
              {selectedGame.title}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              {selectedGame.description}
            </Typography>
          </Box>

          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Stack direction="row" spacing={-1}>
              {[1, 2, 3, 4].map((i) => (
                <Avatar
                  key={i}
                  sx={{
                    width: 48,
                    height: 48,
                    border: `2px solid ${theme.palette.primary.main}`
                  }}
                />
              ))}
            </Stack>

            <Button
              variant="contained"
              color="primary"
              startIcon={<ThumbUpIcon />}
              sx={{ borderRadius: 2, flexShrink: 0 }}
            >
              {selectedGame.reviews} Reviews
            </Button>

            <Paper sx={{ 
              p: 1, 
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              minWidth: 120 
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PeopleIcon sx={{ color: 'common.white' }} />
                <Typography sx={{ color: 'common.white' }}>
                  {selectedGame.players}
                </Typography>
              </Stack>
            </Paper>

          </Stack>
        </Stack>

      
      </Box>
  )
});

export default GameInfo
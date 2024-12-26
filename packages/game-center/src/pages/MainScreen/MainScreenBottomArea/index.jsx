import React, { Suspense } from 'react';
import { Box, Typography } from '@mui/material';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import { fetchGiveaways } from './api';
import useMainScreenBottomArea from './useMainScreenBottomArea';

// Lazy loading GameCard component
const GameCard = React.lazy(() => import('./components/GameCard'));

function MainScreenBottomArea() {
  const { games, loading, error } = useMainScreenBottomArea(fetchGiveaways);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', padding: '20px' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', padding: '10px' }}>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              thumbnail={game.thumbnail || '/default-thumbnail.png'}  // Default thumbnail if not available
              openGiveawayUrl={game.open_giveaway_url}
            />
          ))}
        </Suspense>
      </Box>
    </Box>
  );
}

export default MainScreenBottomArea;

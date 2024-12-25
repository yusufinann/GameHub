import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import GameCard from './components/GameCard';
import { fetchGiveaways } from './api';

function MainScreenBottomArea() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGiveaways();
        setGames(data);
      } catch (error) {
        setError('Failed to load games. Please try again later.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

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
    <Box sx={{ width: '100%', padding: '20px' }}>
      <Header />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
        }}
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            thumbnail={game.thumbnail}
            openGiveawayUrl={game.open_giveaway_url}
          />
        ))}
      </Box>
    </Box>
  );
}

export default MainScreenBottomArea;

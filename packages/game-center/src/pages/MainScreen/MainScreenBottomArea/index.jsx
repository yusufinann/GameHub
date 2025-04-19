import React, { Suspense } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import { fetchGiveaways } from './api';
import useMainScreenBottomArea from './useMainScreenBottomArea';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HighlightsSection from './components/HighlightsSection';
import BrowseGames from './components/BrowseGames';
// Lazy loading GameCard component
const GameCard = React.lazy(() => import('./components/GameCard'));

function MainScreenBottomArea() {
  const { games, loading, error } = useMainScreenBottomArea(fetchGiveaways);
  const theme=useTheme();
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
  const trendGames = games.data.slice(10, 15);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4,  }}>
        <Suspense fallback={<LoadingSpinner />}>
          {/* Popular Games Section */}
          <Box>
          <Header 
             title={"Highlights and Recommended"}
             theme={theme}
             icon={<WhatshotIcon />}
           />
            <Box sx={{ 
              display:'flex',
              gap: 3,
            }}>
           <HighlightsSection/>
            </Box>
          </Box>

          {/* Browse Games Section */}
          <Box>
          <Header 
            title={"Browse Games"}
            theme={theme}
            icon={<NewReleasesIcon />
              
            }
          />
           
             <BrowseGames/>
          </Box>

          {/* Trending Games Section */}
          <Box>
          <Header 
            title={"Trend Games"}
            theme={theme}
            icon={<TrendingUpIcon />}
          />
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 3
            }}>
              {trendGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  thumbnail={game.thumbnail || '/default-thumbnail.png'}
                  openGiveawayUrl={game.open_giveaway_url}
                />
              ))}
            </Box>
          </Box>
        </Suspense>
      </Box>
    </Box>
  );
}
export default MainScreenBottomArea;

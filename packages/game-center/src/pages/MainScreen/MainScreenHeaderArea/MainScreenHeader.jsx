import { Box } from '@mui/material';
import React from 'react';

function MainScreenHeader() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '30vh',
      border: '1px solid red',
      borderRadius: '10px',
      backgroundColor: '#f0f0f0',
      position: 'relative',
      overflow: 'hidden', // Prevent overflow for animation
    }}>
      <Box sx={{
        width: '30%',        
        borderRadius: '10px',
        margin: '5px',
        backgroundImage: 'url(https://cdn1.epicgames.com/hellebore/offer/GameName_Edition_Capsule_1920X1080-1920x1080-3131a5c2e251c88843f63801db17885ae66ca44b.jpg)',
        backgroundSize: 'cover', // Ensures image covers the entire box
        backgroundPosition: 'center',
      }}></Box>

      <Box sx={{
        width: '30%',
        borderRadius: '10px',
        margin: '5px',
        backgroundImage: 'url(https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1029690/capsule_616x353.jpg?t=1734452721)',
        backgroundSize: 'cover', // Ensures image covers the entire box
        backgroundPosition: 'center',
      }}></Box>

      <Box sx={{
        width: '40%',
        borderRadius: '10px',
        margin: '5px',
        backgroundImage: 'url(https://mirragames.com/wp-content/uploads/2024/08/online-games.webp)',
        backgroundSize: 'cover', // Ensures image covers the entire box
        backgroundPosition: 'center',
      }}></Box>
    </Box>
  );
}

export default MainScreenHeader;

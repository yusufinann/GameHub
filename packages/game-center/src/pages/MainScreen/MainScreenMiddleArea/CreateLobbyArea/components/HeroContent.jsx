import React from 'react';
import { Typography, Stack, Button } from '@mui/material';
import { heroStyles } from '../styles';


const HeroContent = ({ onCreateLobby, existingLobby }) => {
  return (
    <Stack spacing={4} alignItems="center">
      <Stack spacing={2} sx={heroStyles.titleContainer}>
        <Typography variant="h3" sx={heroStyles.mainTitle}>
          Discover Your Next
        </Typography>
        <Typography variant="h3" sx={heroStyles.subTitle}>
          Gaming Adventure
        </Typography>
      </Stack>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button variant="contained" size="large" sx={heroStyles.exploreButton}>
          Explore Games
        </Button>
        <Button
          onClick={onCreateLobby}
          variant="outlined"
          size="large"
          sx={heroStyles.lobbyButton}
        >
          {existingLobby ? 'Go your Lobby' : 'Create A Lobby'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default HeroContent;
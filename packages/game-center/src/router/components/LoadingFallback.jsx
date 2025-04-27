import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingFallback = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100%"
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{ mt: 2 }}
      >
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
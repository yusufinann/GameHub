import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoadingFallback = () => {
  const { t } = useTranslation();
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
        {t("common.loading")}
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
    const{t}=useTranslation();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ height: 'calc(100vh - 64px)' }} 
    >
      <Typography variant="h3" gutterBottom>
       {t('notFound.title')}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {t('notFound.message')}
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary">
        {t('notFound.goHomeButton')}
      </Button>
    </Box>
  );
};

export default NotFoundPage;
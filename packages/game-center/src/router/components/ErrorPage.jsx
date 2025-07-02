import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  Paper,
  Container,
  Stack,
  Chip,
  Divider,
  Fade,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  ErrorOutline,
  Home,
  Refresh,
  ArrowBack,
  BugReport
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ErrorPage = () => {
  const { t } = useTranslation();
  const error = useRouteError();
  const theme = useTheme();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        <Fade in timeout={800}>
                      <Paper
            elevation={8}
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: 'center',
              background: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.primary.main,
              maxWidth: 600,
              width: '100%',
              boxShadow: `0 8px 32px ${theme.palette.background.elevation[3]}`
            }}
          >
            <Box sx={{ mb: 4 }}>
              <ErrorOutline 
                sx={{ 
                  fontSize: 80, 
                  color: 'error.main',
                  mb: 2,
                  filter: `drop-shadow(0 4px 8px ${theme.palette.error.main}40)`
                }} 
              />
              
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{
                  fontWeight: 700,
                  background: theme.palette.secondary.main,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                {t('error.title', 'Bir Hata Oluştu')}
              </Typography>

              <Chip 
                label="ERROR 500"
                color="error"
                variant="outlined"
                size="small"
                sx={{ mb: 3 }}
              />
            </Box>

            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              {t('error.message', 'Beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenilemeyi deneyin.')}
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                variant="outlined"
                icon={<BugReport />}
                sx={{ 
                  mb: 4,
                  textAlign: 'left',
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1,color: 'text.secondary' }}>
                  {t('error.errorDetails', 'Hata Detayları')}:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace',color: 'text.secondary' }}>
                  {error.statusText || error.message}
                </Typography>
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              alignItems="center"
            >
              <Button 
                onClick={handleReload}
                variant="contained" 
                color="primary"
                size="large"
                startIcon={<Refresh />}
                sx={{
                  minWidth: 160,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: theme.palette.primary.main,
                  boxShadow: `0 4px 20px ${theme.palette.primary.main}50`,
                  '&:hover': {
                    background: theme.palette.primary.dark,
                    boxShadow: `0 6px 25px ${theme.palette.primary.main}60`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {t('error.reloadButton', 'Sayfayı Yenile')}
              </Button>
              
              <Button 
                component={Link} 
                to="/" 
                variant="outlined" 
                color="secondary"
                size="large"
                startIcon={<Home />}
                sx={{
                  minWidth: 160,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: theme.palette.primary.main + '10',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 15px ${theme.palette.primary.main}30`
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {t('error.goHomeButton', 'Ana Sayfaya Dön')}
              </Button>
            </Stack>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: theme.palette.primary.main + '30' }}>
              <Stack direction="row" spacing={1} justifyContent="center">
                <IconButton
                  onClick={handleGoBack}
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.main + '10'
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                
                <Typography variant="subtitle1" color="text.secondary" sx={{ py: 1 }}>
                  {t('error.previousPage', 'Önceki sayfaya dön')}
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default ErrorPage;
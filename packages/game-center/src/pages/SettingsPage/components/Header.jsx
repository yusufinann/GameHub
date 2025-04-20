import { Box, Typography, Zoom,alpha} from '@mui/material'
import React from 'react'
import { 
    Save as SaveIcon,
    Settings as SettingsIcon,
  } from '@mui/icons-material';
const Header = ({language,theme,showSaveIndicator}) => {
  return (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 6
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>            
          <Box>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                background: theme.palette.text.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <SettingsIcon sx={{ fontSize: 40 }} />
              {language === 'tr' ? 'AYARLAR' : 'SETTINGS'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {language === 'tr' ? 'Tercihlerinizi özelleştirin' : 'Customize your preferences'}
            </Typography>
          </Box>
        </Box>

        <Zoom in={showSaveIndicator}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            color: theme.palette.success.main,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            px: 2,
            py: 1,
            borderRadius: 2
          }}>
            <SaveIcon />
            <Typography variant="body2" fontWeight="bold">
              {language === 'tr' ? 'Kaydedildi!' : 'Saved!'}
            </Typography>
          </Box>
        </Zoom>
      </Box>
  )
}

export default Header

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Paper,
  Typography,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Lock as LockIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { EventFields } from './EventFields'; // Assuming this component is also translated if needed
import { useParams, useLocation } from 'react-router-dom';
import { GAMES } from '../../../utils/constants'; // Assuming GAMES items (like game.title) are translatable or handled elsewhere
import { useTranslation } from 'react-i18next'; // Import useTranslation

function LobbyForm({ formData, setFormData, handleChange, handleSubmit, onClose, isCreatingLobby }) {
  const { gameId } = useParams();
  const location = useLocation();
  const { t } = useTranslation(); // Initialize t
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (gameId) {
      const isGameDetailRoute = location.pathname.includes('game-detail');
      if (isGameDetailRoute) {
        const selectedGame = GAMES.find(game => game.id === parseInt(gameId, 10));
        if (selectedGame) {
          setFormData((prev) => ({
            ...prev,
            gameId: selectedGame.id,
          }));
        }
      }
    }
  }, [gameId, location.pathname, setFormData]);

  const isGameSelectionDisabled = location.pathname.includes('game-detail');

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(34,193,195,0.1) 0%, rgba(253,187,45,0.1) 100%)',
        border: '1px solid rgba(34,193,195,0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarsIcon sx={{ color: 'rgba(34,193,195,1)' }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('lobbyForm.title', 'Create New Lobby')}
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 3 } }}>
        <TextField
          fullWidth
          label={t('lobbyForm.lobbyNameLabel', 'Lobby Name')}
          name="lobbyName"
          value={formData.lobbyName}
          onChange={handleChange}
          required
          autoComplete="off" // Changed from username to off as it's a lobby name
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'rgba(34,193,195,0.8)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(34,193,195,1)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GameIcon sx={{ color: 'rgba(34,193,195,0.8)' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth required sx={{ mb: 3 }}>
          <InputLabel id="game-selection-label">{t('lobbyForm.gameSelectionLabel', 'Game Selection')}</InputLabel>
          <Select
            labelId="game-selection-label"
            name="gameId"
            value={formData.gameId}
            onChange={handleChange}
            label={t('lobbyForm.gameSelectionLabel', 'Game Selection')} // Important for accessibility
            disabled={isGameSelectionDisabled}
            inputProps={{
              autoComplete: 'off',
            }}
            sx={{
              borderRadius: 2,
              '&.MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'rgba(34,193,195,0.8)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(34,193,195,1)',
                },
              },
            }}
          >
            {GAMES.map((game) => (
              <MenuItem
                key={game.id}
                value={game.id}
                sx={{
                  '&:hover': {
                    background: 'linear-gradient(90deg, rgba(34,193,195,0.1), rgba(253,187,45,0.1))',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, rgba(34,193,195,0.2), rgba(253,187,45,0.2))',
                  },
                }}
              >
                
                {t(`games.${game.title}.title`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            background: 'rgb(165, 249, 190, 0.1)',
            border: '1px solid rgb(165, 249, 190, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 2px 10px rgba(34,193,195,0.2)',
            },
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'rgba(34,193,195,1)', fontWeight: 600 }}>
            {t('lobbyForm.lobbyTypeLabel')}
          </Typography>
          <RadioGroup row name="eventType" value={formData.eventType} onChange={handleChange}>
            <FormControlLabel
              value="normal"
              control={
                <Radio
                  sx={{
                    color: 'rgba(34,193,195,0.6)',
                    '&.Mui-checked': {
                      color: 'rgba(34,193,195,1)',
                    },
                  }}
                />
              }
              label={t('lobbyForm.lobbyType.normal')}
              sx={{ mr: 4 }}
            />
            <FormControlLabel
              value="event"
              control={
                <Radio
                  sx={{
                    color: 'rgba(253,187,45,0.6)',
                    '&.Mui-checked': {
                      color: 'rgba(253,187,45,1)',
                    },
                  }}
                />
              }
              label={t('lobbyForm.lobbyType.event')}
            />
          </RadioGroup>
        </Paper>

        {formData.eventType === 'event' && <EventFields formData={formData} handleChange={handleChange}/>}

        <TextField
          fullWidth
          label={t('lobbyForm.maxMembersLabel', 'Max Members')}
          name="maxMembers"
          type="number"
          value={formData.maxMembers}
          onChange={handleChange}
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'rgba(34,193,195,0.8)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(34,193,195,1)',
              },
            },
          }}
          InputProps={{
            inputProps: { min: 1, max: 10 }, 
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="body2" color="rgba(34,193,195,0.8)">
                  👥
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label={t('lobbyForm.passwordLabel')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password" 
          value={formData.password}
          onChange={handleChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: 'rgba(34,193,195,0.8)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(34,193,195,1)',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'rgba(34,193,195,0.8)' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? t('lobbyForm.hidePasswordTooltip', 'Hide password') : t('lobbyForm.showPasswordTooltip', 'Show password')}>
                  <IconButton
                    aria-label={t('lobbyForm.togglePasswordVisibilityAria', 'toggle password visibility')}
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ?
                      <VisibilityOffIcon sx={{ color: 'rgba(34,193,195,0.8)' }} /> :
                      <VisibilityIcon sx={{ color: 'rgba(34,193,195,0.8)' }} />
                    }
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            placeholder: t('lobbyForm.passwordPlaceholder', 'Enter a password (optional)'),
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{
              borderColor: 'rgba(34,193,195,0.8)',
              color: 'rgba(34,193,195,1)',
              borderRadius: 2,
              '&:hover': {
                borderColor: 'rgba(34,193,195,1)',
                backgroundColor: 'rgba(34,193,195,0.1)',
              },
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={isCreatingLobby}
            sx={{
              background: 'linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(34,193,195,0.9), rgba(253,187,45,0.9))',
                boxShadow: '0 4px 15px rgba(34,193,195,0.4)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            {isCreatingLobby ? <CircularProgress size={24} color="inherit" /> : t('lobbyForm.createButton', 'Create Lobby')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default LobbyForm;
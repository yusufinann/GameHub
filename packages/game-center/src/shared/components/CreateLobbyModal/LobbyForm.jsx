import React, { useEffect, useState, useCallback } from 'react';
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
  FormHelperText,
  useTheme,
} from '@mui/material';
import {
  Lock as LockIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  SportsEsports as SportsEsportsIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { EventFields } from './EventFields';
import { useParams, useLocation } from 'react-router-dom';
import { GAMES } from '../../../utils/constants';
import { useTranslation } from 'react-i18next';

const MAX_LOBBY_NAME_LENGTH = 30;
const MIN_MEMBERS = 1;
const MAX_MEMBERS = 20;

function LobbyForm({ formData, setFormData, handleChange: parentHandleChange, handleSubmit: parentHandleSubmit, onClose, isCreatingLobby }) {
  const { gameId: paramGameId } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  
  
  const THEME_COLOR_PRIMARY = theme.palette.primary.main;
  const THEME_COLOR_PRIMARY_MEDIUM = theme.palette.primary.medium;
  const THEME_COLOR_PRIMARY_LIGHT = theme.palette.primary.light;
  const THEME_COLOR_PRIMARY_BORDER = theme.palette.background.dot; 
  const THEME_COLOR_SECONDARY = theme.palette.secondary.main;
  const THEME_COLOR_SECONDARY_LIGHT = theme.palette.secondary.light;
  const RADIO_PAPER_BG = theme.palette.background.elevation[1]; 
  const RADIO_PAPER_BORDER = theme.palette.background.dot;
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (paramGameId) {
      const isGameDetailRoute = location.pathname.includes('game-detail');
      if (isGameDetailRoute) {
        const selectedGame = GAMES.find(game => game.id === parseInt(paramGameId, 10));
        if (selectedGame) {
          setFormData((prev) => ({
            ...prev,
            gameId: selectedGame.id,
          }));
          setErrors(prevErrors => ({...prevErrors, gameId: undefined}));
        }
      }
    }
  }, [paramGameId, location.pathname, setFormData]);

  const isGameSelectionDisabled = location.pathname.includes('game-detail');

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateField = useCallback((name, value) => {
    let errorMsg = '';
    const currentFormData = { ...formData, [name]: value };

    switch (name) {
      case 'lobbyName':
        if (!value.trim()) {
          errorMsg = t('validation.lobbyNameRequired', 'Lobby name is required.');
        } else if (value.length > MAX_LOBBY_NAME_LENGTH) {
          errorMsg = t('validation.lobbyNameMaxLength', { maxLength: MAX_LOBBY_NAME_LENGTH }, `Lobby name cannot exceed ${MAX_LOBBY_NAME_LENGTH} characters.`);
        }
        break;
      case 'gameId':
        if (!value) {
          errorMsg = t('validation.gameRequired', 'Please select a game.');
        }
        break;
      case 'maxMembers':
        const numMembers = parseInt(value, 10);
        if (isNaN(numMembers) || numMembers < MIN_MEMBERS || numMembers > MAX_MEMBERS) {
          errorMsg = t('validation.maxMembersInvalid', { min: MIN_MEMBERS, max: MAX_MEMBERS }, `Max members must be between ${MIN_MEMBERS} and ${MAX_MEMBERS}.`);
        }
        break;
      case 'startTime':
        if (currentFormData.eventType === 'event') {
            if (!value) {
                errorMsg = t('validation.eventStartDateRequired', 'Event start date is required.');
            } else if (currentFormData.endTime && new Date(value) >= new Date(currentFormData.endTime)) {
                errorMsg = t('validation.eventStartDateMustBeBeforeEndDate', 'Start date must be before end date.');
            }
        }
        break;
      case 'endTime':
        if (currentFormData.eventType === 'event') {
            if (!value) {
                errorMsg = t('validation.eventEndDateRequired', 'Event end date is required.');
            } else if (currentFormData.startTime && new Date(currentFormData.startTime) >= new Date(value)) {
                errorMsg = t('validation.eventEndDateMustBeAfterStartDate', 'End date must be after start date.');
            }
        }
        break;
      default:
        break;
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: errorMsg || undefined }));
    
    if (currentFormData.eventType === 'event') {
        if (name === 'startTime' && !errorMsg && value && currentFormData.endTime) {
            if (new Date(value) < new Date(currentFormData.endTime) && errors.endTime === t('validation.eventEndDateMustBeAfterStartDate', 'End date must be after start date.')) {
                 setErrors(prev => ({...prev, endTime: undefined}));
            }
        } else if (name === 'endTime' && !errorMsg && value && currentFormData.startTime) {
            if (new Date(currentFormData.startTime) < new Date(value) && errors.startTime === t('validation.eventStartDateMustBeBeforeEndDate', 'Start date must be before end date.')) {
                 setErrors(prev => ({...prev, startTime: undefined}));
            }
        }
    }
    return !errorMsg;
  }, [t, formData, errors.startTime, errors.endTime]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    parentHandleChange(event); 
    
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }

    if (name === 'eventType' && (type === 'radio' ? value : checked) === 'normal') {
      setErrors(prev => ({ ...prev, startTime: undefined, endTime: undefined }));
    }
  };
  
  const handleBlur = (event) => {
    const { name, value } = event.target;
    validateField(name, value);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.lobbyName.trim()) {
      newErrors.lobbyName = t('validation.lobbyNameRequired', 'Lobby name is required.');
      isValid = false;
    } else if (formData.lobbyName.length > MAX_LOBBY_NAME_LENGTH) {
      newErrors.lobbyName = t('validation.lobbyNameMaxLength', { maxLength: MAX_LOBBY_NAME_LENGTH }, `Lobby name cannot exceed ${MAX_LOBBY_NAME_LENGTH} characters.`);
      isValid = false;
    }

    if (!formData.gameId) {
      newErrors.gameId = t('validation.gameRequired', 'Please select a game.');
      isValid = false;
    }

    const numMembers = parseInt(formData.maxMembers, 10);
    if (isNaN(numMembers) || numMembers < MIN_MEMBERS || numMembers > MAX_MEMBERS) {
      newErrors.maxMembers = t('validation.maxMembersInvalid', { min: MIN_MEMBERS, max: MAX_MEMBERS }, `Max members must be between ${MIN_MEMBERS} and ${MAX_MEMBERS}.`);
      isValid = false;
    }

    if (formData.eventType === 'event') {
      let startDateValid = true;
      let endDateValid = true;

      if (!formData.startTime) {
        newErrors.startTime = t('validation.eventStartDateRequired', 'Event start date is required.');
        isValid = false;
        startDateValid = false;
      }
      if (!formData.endTime) {
        newErrors.endTime = t('validation.eventEndDateRequired', 'Event end date is required.');
        isValid = false;
        endDateValid = false;
      }
      
      if (startDateValid && endDateValid && formData.startTime && formData.endTime) {
        const startDate = new Date(formData.startTime);
        const endDate = new Date(formData.endTime);
        if (startDate >= endDate) {
          newErrors.startTime = t('validation.eventStartDateMustBeBeforeEndDate', 'Start date must be before end date.');
          newErrors.endTime = t('validation.eventEndDateMustBeAfterStartDate', 'End date must be after start date.');
          isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      parentHandleSubmit(event);
    }
  };

  // Shared styles
  const textFieldSx = (hasError) => ({
    mb: hasError ? 3 : 1.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&:hover fieldset': { borderColor: THEME_COLOR_PRIMARY_MEDIUM },
      '&.Mui-focused fieldset': { borderColor: THEME_COLOR_PRIMARY },
    },
    '& label.Mui-focused': { color: THEME_COLOR_PRIMARY },
    '& .MuiFormHelperText-root': { minHeight: '1.25em' }
  });
  
  const formControlSx = (hasError) => ({
    mb: hasError ? 3 : 1.5,
    '& .MuiOutlinedInput-root': { 
      borderRadius: 2,
      '&:hover fieldset': { borderColor: THEME_COLOR_PRIMARY_MEDIUM },
      '&.Mui-focused fieldset': { borderColor: THEME_COLOR_PRIMARY },
    },
    '& label.Mui-focused': { color: THEME_COLOR_PRIMARY },
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 2,
        background: 'linear-gradient(135deg, rgba(34,193,195,0.1) 0%, rgba(253,187,45,0.1) 100%)',
        border: `1px solid ${THEME_COLOR_PRIMARY_BORDER}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3, 
        alignItems: 'center',
        pb: 2,
        borderBottom: `1px solid ${THEME_COLOR_PRIMARY_BORDER}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarsIcon sx={{ color: THEME_COLOR_PRIMARY, fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${THEME_COLOR_PRIMARY}, ${THEME_COLOR_SECONDARY})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('lobbyForm.title', 'Create New Lobby')}
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label={t('lobbyForm.lobbyNameLabel', 'Lobby Name')}
          name="lobbyName"
          value={formData.lobbyName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={!!errors.lobbyName}
          helperText={errors.lobbyName || (formData.lobbyName.length > 0 && !errors.lobbyName ? `${formData.lobbyName.length}/${MAX_LOBBY_NAME_LENGTH}` : ' ')}
          autoComplete="off"
          inputProps={{ maxLength: MAX_LOBBY_NAME_LENGTH }}
          sx={textFieldSx(!!errors.lobbyName)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GameIcon sx={{ color: THEME_COLOR_PRIMARY_MEDIUM }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl 
          fullWidth 
          required 
          error={!!errors.gameId} 
          sx={formControlSx(!!errors.gameId)}
        >
          <InputLabel id="game-selection-label">{t('lobbyForm.gameSelectionLabel', 'Game Selection')}</InputLabel>
          <Select
            labelId="game-selection-label"
            name="gameId"
            value={formData.gameId}
            onChange={handleChange}
            onBlur={handleBlur}
            label={t('lobbyForm.gameSelectionLabel', 'Game Selection')}
            disabled={isGameSelectionDisabled}
            inputProps={{ autoComplete: 'off' }}
            startAdornment={
              <InputAdornment position="start" sx={{ ml: -0.5, mr: 1 }}>
                <SportsEsportsIcon sx={{ color: THEME_COLOR_PRIMARY_MEDIUM }} />
              </InputAdornment>
            }
          >
            {GAMES.map((game) => (
              <MenuItem
                key={game.id}
                value={game.id}
                sx={{
                  '&:hover': { background: 'linear-gradient(90deg, rgba(34,193,195,0.1), rgba(253,187,45,0.1))' },
                  '&.Mui-selected': { background: 'linear-gradient(90deg, rgba(34,193,195,0.2), rgba(253,187,45,0.2))' },
                }}
              >
                {t(`games.${game.id}.title`, game.title)}
              </MenuItem>
            ))}
          </Select>
          {errors.gameId && <FormHelperText error sx={{ minHeight: '1.25em', ml: 1.75, mt: 0.5 }}>{errors.gameId}</FormHelperText>}
          {!errors.gameId && <FormHelperText sx={{ minHeight: '1.25em', ml: 1.75, mt: 0.5 }}> </FormHelperText>}
        </FormControl>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            background: RADIO_PAPER_BG,
            border: `1px solid ${RADIO_PAPER_BORDER}`,
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 2px 10px rgba(34,193,195,0.2)' },
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1.5, color: THEME_COLOR_PRIMARY, fontWeight: 600 }}>
            {t('lobbyForm.lobbyTypeLabel', 'Lobby Type')}
          </Typography>
          <RadioGroup row name="eventType" value={formData.eventType} onChange={handleChange}>
            <FormControlLabel
              value="normal"
              control={
                <Radio sx={{ color: THEME_COLOR_PRIMARY_LIGHT, '&.Mui-checked': { color: THEME_COLOR_PRIMARY } }} />
              }
              label={t('lobbyForm.lobbyType.normal', 'Normal')}
              sx={{ mr: 4 }}
            />
            <FormControlLabel
              value="event"
              control={
                <Radio sx={{ color: THEME_COLOR_SECONDARY_LIGHT, '&.Mui-checked': { color: THEME_COLOR_SECONDARY } }} />
              }
              label={t('lobbyForm.lobbyType.event', 'Event')}
            />
          </RadioGroup>
        </Paper>

        {formData.eventType === 'event' && (
          <EventFields
            formData={formData}
            handleChange={handleChange}
            handleBlur={handleBlur}
            errors={errors}
            t={t}
          />
        )}

        <TextField
          fullWidth
          label={t('lobbyForm.maxMembersLabel', 'Max Members')}
          name="maxMembers"
          type="number"
          value={formData.maxMembers}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          error={!!errors.maxMembers}
          helperText={errors.maxMembers || ' '}
          sx={textFieldSx(!!errors.maxMembers)}
          InputProps={{
            inputProps: { min: MIN_MEMBERS, max: MAX_MEMBERS, autoComplete: 'off' },
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon sx={{ color: THEME_COLOR_PRIMARY_MEDIUM }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label={t('lobbyForm.passwordLabel', 'Password (Optional)')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!errors.password}
          helperText={errors.password || ' '}
          sx={textFieldSx(!!errors.password)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: THEME_COLOR_PRIMARY_MEDIUM }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? t('lobbyForm.hidePasswordTooltip', 'Hide password') : t('lobbyForm.showPasswordTooltip', 'Show password')}>
                  <IconButton
                    aria-label={t('lobbyForm.togglePasswordVisibilityAria', 'toggle password visibility')}
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    sx={{ color: THEME_COLOR_PRIMARY_MEDIUM }}
                  >
                    {showPassword ?
                      <VisibilityOffIcon /> :
                      <VisibilityIcon />
                    }
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            placeholder: t('lobbyForm.passwordPlaceholder', 'Leave blank for no password'),
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{
              borderColor: THEME_COLOR_PRIMARY_MEDIUM,
              color: THEME_COLOR_PRIMARY,
              borderRadius: 2,
              '&:hover': {
                borderColor: THEME_COLOR_PRIMARY,
                backgroundColor: 'rgba(34,193,195,0.1)',
              },
              textTransform: 'none', py: 1.5, fontSize: '1rem', transition: 'all 0.3s ease',
            }}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={isCreatingLobby}
            sx={{
              background: `linear-gradient(45deg, ${THEME_COLOR_PRIMARY}, ${THEME_COLOR_SECONDARY})`,
              borderRadius: 2,
              '&:hover': {
                boxShadow: '0 4px 15px rgba(34,193,195,0.4)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none', 
              py: 1.5, 
              fontSize: '1rem', 
              transition: 'all 0.3s ease',
              color: '#fff'
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
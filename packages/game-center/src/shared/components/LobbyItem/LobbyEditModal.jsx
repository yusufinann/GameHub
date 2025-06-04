import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  Slide,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Button,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  FormHelperText,
  useTheme,
} from "@mui/material";
import {
  Lock as LockIcon,
  SportsEsports as GameIcon, 
  Stars as StarsIcon,
  Close as CloseIcon,
  SportsEsports as SportsEsportsIcon, 
  Group as GroupIcon, 
} from "@mui/icons-material";
import { GAMES } from "../../../utils/constants";
import { EventFields } from "../CreateLobbyModal/EventFields";
import formatDateForInputLocal from "../../../utils/formatDate";
import { updateLobby as apiUpdateLobby } from "./api";
import { useTranslation } from "react-i18next";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MAX_LOBBY_NAME_LENGTH = 30;
const MIN_MEMBERS = 1;
const MAX_MEMBERS = 20;


function LobbyEditModal({ open, onClose, lobby }) {
  const theme = useTheme();
const THEME_COLOR_PRIMARY = theme.palette.primary.main;
const THEME_COLOR_PRIMARY_MEDIUM = theme.palette.primary.medium;
const THEME_COLOR_PRIMARY_LIGHT = theme.palette.primary.light;
const THEME_COLOR_PRIMARY_BORDER = theme.palette.background.dot; 
const THEME_COLOR_SECONDARY = theme.palette.secondary.main;
const THEME_COLOR_SECONDARY_LIGHT = theme.palette.secondary.light;
const RADIO_PAPER_BG = theme.palette.background.elevation[1]; 
const RADIO_PAPER_BORDER = theme.palette.background.dot; 
  const [formData, setFormData] = useState({
    lobbyName: "",
    gameId: "",
    eventType: "normal",
    startTime: "",
    endTime: "",
    maxMembers: 4,
    password: "",
    passwordConfirm: "",
  });

  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    if (lobby) {
      setFormData({
        lobbyName: lobby.lobbyName || "",
        gameId: lobby.game || "",
        eventType: lobby.lobbyType || "normal",
        startTime: lobby.startTime ? formatDateForInputLocal(lobby.startTime) : "",
        endTime: lobby.endTime ? formatDateForInputLocal(lobby.endTime) : "",
        maxMembers: lobby.maxMembers || 4,
        password: "",
        passwordConfirm: "",
      });
      setPasswordEnabled(!!lobby.password);
      setErrors({});
    } else {
      setFormData({
        lobbyName: "", gameId: "", eventType: "normal", startTime: "",
        endTime: "", maxMembers: 4, password: "", passwordConfirm: "",
      });
      setPasswordEnabled(false);
      setErrors({});
    }
  }, [lobby]);


  const validateField = useCallback((name, value, currentFormData = formData) => {
    let error = "";
    const dataToValidate = { ...currentFormData, [name]: value };

    switch (name) {
      case "lobbyName":
        if (!value.trim()) {
          error = t("validation.lobbyNameRequired", "Lobby name is required.");
        } else if (value.length > MAX_LOBBY_NAME_LENGTH) {
          error = t("validation.lobbyNameMaxLength", { maxLength: MAX_LOBBY_NAME_LENGTH }, `Lobby name cannot exceed ${MAX_LOBBY_NAME_LENGTH} characters.`);
        }
        break;
      case "gameId":
        if (!value) {
          error = t("validation.gameRequired", "Please select a game.");
        }
        break;
      case "maxMembers":
        const numMaxMembers = parseInt(value, 10);
        if (isNaN(numMaxMembers) || numMaxMembers < MIN_MEMBERS || numMaxMembers > MAX_MEMBERS) {
          error = t("validation.maxMembersInvalid", { min: MIN_MEMBERS, max: MAX_MEMBERS }, `Max members must be between ${MIN_MEMBERS} and ${MAX_MEMBERS}.`);
        }
        break;
      case "passwordConfirm":
        if (passwordEnabled && dataToValidate.password && value !== dataToValidate.password) {
          error = t("validation.passwordsDoNotMatch", "Passwords do not match.");
        }
        break;
      case "startTime":
        if (dataToValidate.eventType === "event") {
          if (!value) {
            error = t("validation.eventStartDateRequired", "Event start date is required.");
          } else if (dataToValidate.endTime && new Date(value) >= new Date(dataToValidate.endTime)) {
            error = t("validation.eventStartDateMustBeBeforeEndDate", "Start date must be before end date.");
          }
        }
        break;
      case "endTime":
        if (dataToValidate.eventType === "event") {
          if (!value) {
            error = t("validation.eventEndDateRequired", "Event end date is required.");
          } else if (dataToValidate.startTime && new Date(value) <= new Date(dataToValidate.startTime)) {
            error = t("validation.eventEndDateMustBeAfterStartDate", "End date must be after start date.");
          }
        }
        break;
      default:
        break;
    }
    return error;
  }, [formData, passwordEnabled, t]);


  const handleChange = useCallback((e) => {
    const { name, type, value, valueAsNumber, checked } = e.target;
    const valToSet = type === "checkbox" ? checked : (type === "number" ? (Number.isNaN(valueAsNumber) ? "" : valueAsNumber) : value);

    setFormData(prev => {
      const newFormData = { ...prev, [name]: valToSet };
      if (name === "eventType") {
        if (valToSet === "normal") {
            newFormData.startTime = "";
            newFormData.endTime = "";
        }
        setErrors(currentErrors => ({ ...currentErrors, startTime: undefined, endTime: undefined }));
      }
      if (name === "password" && !valToSet && errors.passwordConfirm === t("validation.passwordsDoNotMatch", "Passwords do not match.")) {
          setErrors(currentErrors => ({ ...currentErrors, passwordConfirm: undefined }));
      }
      return newFormData;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors, t]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(currentForm => {
        const errorMsg = validateField(name, value, currentForm);
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors, [name]: errorMsg || undefined };
          if (currentForm.eventType === 'event') {
            const currentStartTime = name === 'startTime' ? value : currentForm.startTime;
            const currentEndTime = name === 'endTime' ? value : currentForm.endTime;

            if (name === 'startTime' && !errorMsg && currentStartTime && currentEndTime) {
              if (new Date(currentStartTime) < new Date(currentEndTime) &&
                  newErrors.endTime === t('validation.eventEndDateMustBeAfterStartDate', 'End date must be after start date.')) {
                newErrors.endTime = undefined;
              }
            } else if (name === 'endTime' && !errorMsg && currentStartTime && currentEndTime) {
              if (new Date(currentStartTime) < new Date(currentEndTime) &&
                  newErrors.startTime === t('validation.eventStartDateMustBeBeforeEndDate', 'Start date must be before end date.')) {
                newErrors.startTime = undefined;
              }
            }
          }
          return newErrors;
        });
        return currentForm;
    });
  }, [validateField, t]);

  const handlePasswordEnableToggle = useCallback((event) => {
    const isEnabled = event.target.checked;
    setPasswordEnabled(isEnabled);
    if (!isEnabled) {
      setFormData(prev => ({ ...prev, password: "", passwordConfirm: "" }));
      setErrors(prev => ({ ...prev, password: undefined, passwordConfirm: undefined }));
    }
  }, []);


  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    const currentFormData = formData;

    const lobbyNameError = validateField("lobbyName", currentFormData.lobbyName, currentFormData);
    if (lobbyNameError) { newErrors.lobbyName = lobbyNameError; isValid = false; }

    const gameIdError = validateField("gameId", currentFormData.gameId, currentFormData);
    if (gameIdError) { newErrors.gameId = gameIdError; isValid = false; }

    const maxMembersError = validateField("maxMembers", String(currentFormData.maxMembers), currentFormData);
    if (maxMembersError) { newErrors.maxMembers = maxMembersError; isValid = false; }

    if (currentFormData.eventType === "event") {
      const startTimeError = validateField("startTime", currentFormData.startTime, currentFormData);
      if (startTimeError && startTimeError !== t("validation.eventStartDateMustBeBeforeEndDate", "Start date must be before end date.")) {
        newErrors.startTime = startTimeError; isValid = false;
      }
      const endTimeError = validateField("endTime", currentFormData.endTime, currentFormData);
      if (endTimeError && endTimeError !== t("validation.eventEndDateMustBeAfterStartDate", "End date must be after start date.")) {
        newErrors.endTime = endTimeError; isValid = false;
      }
      if (currentFormData.startTime && currentFormData.endTime) {
        const startDate = new Date(currentFormData.startTime);
        const endDate = new Date(currentFormData.endTime);
        if (startDate >= endDate) {
          if (!newErrors.startTime) newErrors.startTime = t("validation.eventStartDateMustBeBeforeEndDate", "Start date must be before end date.");
          if (!newErrors.endTime) newErrors.endTime = t("validation.eventEndDateMustBeAfterStartDate", "End date must be after start date.");
          isValid = false;
        }
      } else {
         if (!currentFormData.startTime && !newErrors.startTime) {
            newErrors.startTime = t("validation.eventStartDateRequired", "Event start date is required.");
            isValid = false;
         }
         if (!currentFormData.endTime && !newErrors.endTime) {
            newErrors.endTime = t("validation.eventEndDateRequired", "Event end date is required.");
            isValid = false;
         }
      }
    }

    if (passwordEnabled) {
      if (currentFormData.password) {
        if (!currentFormData.passwordConfirm) {
          newErrors.passwordConfirm = t("validation.passwordConfirmRequired", "Confirm password is required.");
          isValid = false;
        } else {
            const pwdConfirmError = validateField("passwordConfirm", currentFormData.passwordConfirm, currentFormData);
            if(pwdConfirmError) { newErrors.passwordConfirm = pwdConfirmError; isValid = false;}
        }
      } else {
        if (currentFormData.passwordConfirm) {
          newErrors.passwordConfirm = t("validation.passwordConfirmMustBeEmptyIfPasswordIsEmpty", "Confirm password must be empty if New Password is empty.");
          isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  }, [formData, passwordEnabled, t, validateField]);


  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({ open: true, message: t("lobby.error.validationFailed", "Form validation failed. Please check the fields."), severity: "error" });
      return;
    }
    if (!lobby?.lobbyCode) {
      console.error("Lobby code is missing, cannot update.");
      setSnackbar({ open: true, message: t("lobby.error.identifierMissing", "Lobby identifier is missing."), severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        lobbyName: formData.lobbyName,
        game: formData.gameId,
        lobbyType: formData.eventType,
        maxMembers: Number(formData.maxMembers),
      };
      if (formData.eventType === 'event') {
        payload.startTime = formData.startTime ? new Date(formData.startTime).toISOString() : null;
        payload.endTime = formData.endTime ? new Date(formData.endTime).toISOString() : null;
      } else {
        payload.startTime = null;
        payload.endTime = null;
      }
      if (!passwordEnabled) {
        payload.password = null;
      } else if (formData.password) {
        payload.password = formData.password;
      }
      await apiUpdateLobby(lobby.lobbyCode, payload);
      setSnackbar({ open: true, message: t("lobby.success.updated", "Lobby updated successfully!"), severity: "success" });
      setTimeout(() => onClose(true), 1500);
    } catch (error) {
      console.error("Lobby update error details:", error);
      let displayedMessage = t("lobby.error.genericUpdateFailed", "Failed to update lobby. Please try again.");
      if (error.isApiError && error.data) {
        if (error.data.messageKey) {
          displayedMessage = t(error.data.messageKey, error.data.messageParams || {});
        } else if (error.data.message) {
          const directTranslation = t(error.data.message);
          displayedMessage = directTranslation !== error.data.message ? directTranslation : error.data.message;
        }
      } else if (error.message) {
        const directTranslation = t(error.message);
        displayedMessage = directTranslation !== error.message ? directTranslation : error.message;
      }
      setSnackbar({ open: true, message: displayedMessage, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [formData, lobby, onClose, passwordEnabled, t, validateForm]);


  if (!lobby) {
    return (
      <Dialog open={open} onClose={() => onClose(false)}>
        <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <CircularProgress sx={{ color: THEME_COLOR_PRIMARY }} />
        </Box>
      </Dialog>
    );
  }

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
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => onClose(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          overflowY: "auto",
          borderRadius: 2, 
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)" 
        }
      }}
    >
      <Paper
        elevation={0} 
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 2, 
          background: 'linear-gradient(135deg, rgba(34,193,195,0.1) 0%, rgba(253,187,45,0.1) 100%)',
          border: `1px solid ${THEME_COLOR_PRIMARY_BORDER}`,
        }}
      >
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3, 
          alignItems: "center",
          pb: 2,
          borderBottom: `1px solid ${THEME_COLOR_PRIMARY_BORDER}`
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              {t("Edit Lobby")}
            </Typography>
          </Box>
          <IconButton
            onClick={() => onClose(false)}
            aria-label="close"
            sx={{
              color: THEME_COLOR_PRIMARY_MEDIUM,
              '&:hover': {
                backgroundColor: 'rgba(34,193,195,0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label={t("lobbyForm.lobbyNameLabel", "Lobby Name")}
            name="lobbyName"
            value={formData.lobbyName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.lobbyName}
            helperText={errors.lobbyName || (formData.lobbyName.length > 0 && !errors.lobbyName ? `${formData.lobbyName.length}/${MAX_LOBBY_NAME_LENGTH}` : ' ')}
            required
            variant="outlined"
            inputProps={{ maxLength: MAX_LOBBY_NAME_LENGTH, autoComplete: 'off' }}
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
            <InputLabel id="edit-game-selection-label">{t("lobbyForm.gameSelectionLabel", "Game Selection")}</InputLabel>
            <Select
              labelId="edit-game-selection-label"
              name="gameId"
              value={formData.gameId}
              onChange={handleChange}
              onBlur={handleBlur}
              label={t("lobbyForm.gameSelectionLabel", "Game Selection")}
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
                    '&:hover': { background: `linear-gradient(90deg, rgba(34,193,195,0.1), rgba(253,187,45,0.1))` },
                    '&.Mui-selected': { background: `linear-gradient(90deg, rgba(34,193,195,0.2), rgba(253,187,45,0.2))` },
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
              {t("lobbyForm.lobbyTypeLabel", "Lobby Type")}
            </Typography>
            <RadioGroup row name="eventType" value={formData.eventType} onChange={handleChange}>
              <FormControlLabel
                value="normal"
                control={<Radio sx={{ color: THEME_COLOR_PRIMARY_LIGHT, '&.Mui-checked': { color: THEME_COLOR_PRIMARY } }} />}
                label={t("lobbyForm.lobbyType.normal", "Normal" )}
                sx={{ mr: 4 }}
              />
              <FormControlLabel
                value="event"
                control={<Radio sx={{ color: THEME_COLOR_SECONDARY_LIGHT, '&.Mui-checked': { color: THEME_COLOR_SECONDARY } }} />} // Using secondary color for event like LobbyForm
                label={t("lobbyForm.lobbyType.event", "Event")}
              />
            </RadioGroup>
          </Paper>

          {formData.eventType === "event" && (
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
            label={t("lobbyForm.maxMembersLabel", "Max Members")}
            name="maxMembers"
            type="number"
            value={formData.maxMembers}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!errors.maxMembers}
            helperText={errors.maxMembers || ' '}
            required
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

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: passwordEnabled ? 1 : 2 }}>
            <Typography variant="subtitle1" sx={{ color: THEME_COLOR_PRIMARY, fontWeight: 600 }}>
              {t("Password Protection")}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={passwordEnabled}
                  onChange={handlePasswordEnableToggle}
                  name="passwordEnabled"
                  disabled={loading}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: THEME_COLOR_PRIMARY,
                      '&:hover': { backgroundColor: 'rgba(34,193,195,0.08)' },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: THEME_COLOR_PRIMARY,
                    },
                  }}
                />
              }
              label={t("Enable Password")}
            />
          </Box>

          {passwordEnabled && (
            <Box sx={{
              p: 2.5,
              mb: 1.5, 
              borderRadius: 2,
              background: 'rgba(34,193,195,0.03)', 
              border: '1px solid rgba(34,193,195,0.15)', 
            }}>
              <TextField
                fullWidth
                label={t("New Password")}
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password || t("Leave blank to keep the current password")}
                sx={textFieldSx(!!errors.password)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: THEME_COLOR_PRIMARY_MEDIUM }} />
                    </InputAdornment>
                  )
                }}
              />
              <TextField 
                fullWidth
                label={t("Confirm New Password")}
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!errors.passwordConfirm}
                helperText={errors.passwordConfirm || ' '}
                sx={textFieldSx(!!errors.passwordConfirm)} 
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => onClose(false)}
              fullWidth
              disabled={loading}
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
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                background: `linear-gradient(45deg, ${THEME_COLOR_PRIMARY}, ${THEME_COLOR_SECONDARY})`,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 4px 15px rgba(34,193,195,0.4)',
                  transform: 'translateY(-2px)',
                },
                textTransform: 'none', py: 1.5, fontSize: '1rem', transition: 'all 0.3s ease',
                color: '#fff' 
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t("Save Changes")}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default LobbyEditModal;
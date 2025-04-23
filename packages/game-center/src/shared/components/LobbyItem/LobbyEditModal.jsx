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
} from "@mui/material";
import {
  Lock as LockIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  Close as CloseIcon,
  Sports as SportsEsports,
  Group as GroupIcon,
} from "@mui/icons-material";
import { GAMES } from "../../../utils/constants";
import { EventFields } from "../CreateLobbyModal/EventFields";
import formatDateForInputLocal from "../../../utils/formatDate";
import { updateLobby as apiUpdateLobby } from "./api";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function LobbyEditModal({ open, onClose, lobby }) {
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
    } else {
      setFormData({
        lobbyName: "",
        gameId: "",
        eventType: "normal",
        startTime: "",
        endTime: "",
        maxMembers: 4,
        password: "",
        passwordConfirm: "",
      });
      setPasswordEnabled(false);
    }
  }, [lobby]);

  const handleChange = useCallback((e) => {
    const { name, type, value, valueAsNumber } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number"
        ? (Number.isNaN(valueAsNumber) ? "" : valueAsNumber)
        : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!lobby?.lobbyCode) {
      console.error("Lobby code is missing, cannot update.");
      setSnackbar({ open: true, message: "Error: Lobby identifier missing.", severity: "error" });
      return;
    }

    if (passwordEnabled && formData.password) {
      if (formData.password !== formData.passwordConfirm) {
        setSnackbar({ open: true, message: "Şifreler eşleşmiyor.", severity: "error" });
        return;
      }
    }

    setLoading(true);
    try {
      const startTimeISO = formData.startTime ? new Date(formData.startTime).toISOString() : null;
      const endTimeISO = formData.endTime ? new Date(formData.endTime).toISOString() : null;
      const payload = {
        lobbyName: formData.lobbyName,
        game: formData.gameId,
        lobbyType: formData.eventType,
        startTime: startTimeISO,
        endTime: endTimeISO,
        maxMembers: formData.maxMembers,
      };

      if (!passwordEnabled) {
        payload.password = null;
      } else if (formData.password) {
        payload.password = formData.password;
      }

      await apiUpdateLobby(lobby.lobbyCode, payload);
      setSnackbar({ open: true, message: "Lobby başarıyla güncellendi!", severity: "success" });
      setTimeout(() => onClose(true), 1500);
    } catch (error) {
      console.error("Lobby update error:", error);
      setSnackbar({ open: true, message: error.message || "Lobby güncelleme başarısız.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [formData, lobby, onClose, passwordEnabled]);

  if (!lobby) {
    return (
      <Dialog open={open} onClose={onClose}>
        <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <CircularProgress sx={{ color: "secondary.main" }} />
        </Box>
      </Dialog>
    );
  }

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
          background: (theme) => 
            theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, rgba(202,236,213,0.6), rgba(50,135,97,0.05))'
              : 'linear-gradient(135deg, rgba(26,54,93,0.6), rgba(29,46,74,0.2))',
          border: (theme) => 
            theme.palette.mode === 'light'
              ? '1px solid rgba(50,135,97,0.2)'
              : '1px solid rgba(65,105,225,0.2)',
        }}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          mb: 3, 
          alignItems: "center",
          pb: 2,
          borderBottom: (theme) => 
            theme.palette.mode === 'light'
              ? '1px solid rgba(50,135,97,0.2)'
              : '1px solid rgba(65,105,225,0.2)'
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <StarsIcon sx={{ 
              color: (theme) => 
                theme.palette.mode === 'light' 
                  ? 'primary.darker' 
                  : 'secondary.main',
              fontSize: 28
            }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(45deg, rgba(50,135,97,1), rgba(66,183,129,0.9))'
                    : 'linear-gradient(45deg, rgba(65,105,225,1), rgba(65,105,225,0.7))',
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Edit Lobby
            </Typography>
          </Box>
          <IconButton 
            onClick={() => onClose(false)} 
            aria-label="close"
            sx={{
              color: (theme) => 
                theme.palette.mode === 'light' 
                  ? 'primary.darker' 
                  : 'secondary.main',
              '&:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'rgba(50,135,97,0.1)'
                    : 'rgba(65,105,225,0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            "& .MuiTextField-root": { mb: 2.5 },
            "& .MuiFormControl-root": { mb: 2.5 },
          }}
        >
          <TextField
            fullWidth
            label="Lobby Name"
            name="lobbyName"
            value={formData.lobbyName}
            onChange={handleChange}
            required
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GameIcon sx={{ 
                    color: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'primary.medium' 
                        : 'secondary.light' 
                  }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: (theme) => 
                    theme.palette.mode === 'light' 
                      ? 'primary.medium' 
                      : 'secondary.main'
                }
              },
              '& label.Mui-focused': {
                color: (theme) => 
                  theme.palette.mode === 'light' 
                    ? 'primary.medium' 
                    : 'secondary.main'
              }
            }}
          />

          <FormControl 
            fullWidth 
            required 
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: (theme) => 
                    theme.palette.mode === 'light' 
                      ? 'primary.medium' 
                      : 'secondary.main'
                }
              },
              '& label.Mui-focused': {
                color: (theme) => 
                  theme.palette.mode === 'light' 
                    ? 'primary.medium' 
                    : 'secondary.main'
              }
            }}
          >
            <InputLabel>Game Selection</InputLabel>
            <Select 
              name="gameId" 
              value={formData.gameId} 
              onChange={handleChange} 
              label="Game Selection"
              startAdornment={
                <InputAdornment position="start" sx={{ ml: -0.5, mr: 1 }}>
                  <SportsEsports sx={{ 
                    color: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'primary.medium' 
                        : 'secondary.light' 
                  }} />
                </InputAdornment>
              }
            >
              {GAMES.map((game) => (
                <MenuItem key={game.id} value={game.id}>
                  {game.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 2,
              background: (theme) => 
                theme.palette.mode === 'light'
                  ? 'rgba(165, 249, 190, 0.1)'
                  : 'rgba(65, 105, 225, 0.05)',
              border: (theme) => 
                theme.palette.mode === 'light'
                  ? '1px solid rgba(165, 249, 190, 0.3)'
                  : '1px solid rgba(65, 105, 225, 0.2)',
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'primary.medium'
                    : 'secondary.main',
              }}
            >
              Lobby Type
            </Typography>
            <RadioGroup 
              row 
              name="eventType" 
              value={formData.eventType} 
              onChange={handleChange}
            >
              <FormControlLabel 
                value="normal" 
                control={
                  <Radio 
                    sx={{
                      color: (theme) => 
                        theme.palette.mode === 'light'
                          ? 'primary.medium'
                          : 'secondary.light',
                      '&.Mui-checked': {
                        color: (theme) => 
                          theme.palette.mode === 'light'
                            ? 'primary.medium'
                            : 'secondary.main',
                      }
                    }}
                  />
                } 
                label="Normal" 
                sx={{ mr: 4 }} 
              />
              <FormControlLabel 
                value="event" 
                control={
                  <Radio 
                    sx={{
                      color: (theme) => 
                        theme.palette.mode === 'light'
                          ? 'primary.medium'
                          : 'secondary.light',
                      '&.Mui-checked': {
                        color: (theme) => 
                          theme.palette.mode === 'light'
                            ? 'primary.medium'
                            : 'secondary.main',
                      }
                    }}
                  />
                } 
                label="Event" 
              />
            </RadioGroup>
          </Paper>

          {formData.eventType === "event" && <EventFields formData={formData} handleChange={handleChange} />}

          <TextField
            fullWidth
            label="Max Members"
            name="maxMembers"
            type="number"
            value={formData.maxMembers}
            onChange={handleChange}
            required
            InputProps={{ 
              inputProps: { min: 1, max: 10 },
              startAdornment: (
                <InputAdornment position="start">
                  <GroupIcon sx={{ 
                    color: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'primary.medium' 
                        : 'secondary.light' 
                  }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: (theme) => 
                    theme.palette.mode === 'light' 
                      ? 'primary.medium' 
                      : 'secondary.main'
                }
              },
              '& label.Mui-focused': {
                color: (theme) => 
                  theme.palette.mode === 'light' 
                    ? 'primary.medium' 
                    : 'secondary.main'
              }
            }}
          />

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'primary.medium'
                    : 'secondary.main'
              }}
            >
              Password Protection
            </Typography>
            <FormControlLabel
              control={
                <Switch 
                  checked={passwordEnabled} 
                  onChange={(e) => setPasswordEnabled(e.target.checked)} 
                  name="passwordEnabled" 
                  disabled={loading}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: (theme) => 
                        theme.palette.mode === 'light'
                          ? 'primary.medium'
                          : 'secondary.main',
                      '&:hover': {
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'light'
                            ? 'rgba(66, 183, 129, 0.08)'
                            : 'rgba(65, 105, 225, 0.08)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'light'
                          ? 'primary.medium'
                          : 'secondary.main',
                    },
                  }}
                />
              }
              label="Enable Password"
            />
          </Box>

          {passwordEnabled && (
            <Box sx={{ 
              p: 2.5, 
              mb: 1, 
              borderRadius: 2,
              background: (theme) => 
                theme.palette.mode === 'light'
                  ? 'rgba(165, 249, 190, 0.05)'
                  : 'rgba(65, 105, 225, 0.03)',
              border: (theme) => 
                theme.palette.mode === 'light'
                  ? '1px solid rgba(165, 249, 190, 0.2)'
                  : '1px solid rgba(65, 105, 225, 0.1)',
            }}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{ 
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ 
                        color: (theme) => 
                          theme.palette.mode === 'light' 
                            ? 'primary.medium' 
                            : 'secondary.light' 
                      }} />
                    </InputAdornment>
                  ) 
                }}
                helperText="Leave blank to keep the current password"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => 
                        theme.palette.mode === 'light' 
                          ? 'primary.medium' 
                          : 'secondary.main'
                    }
                  },
                  '& label.Mui-focused': {
                    color: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'primary.medium' 
                        : 'secondary.main'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => 
                        theme.palette.mode === 'light' 
                          ? 'primary.medium' 
                          : 'secondary.main'
                    }
                  },
                  '& label.Mui-focused': {
                    color: (theme) => 
                      theme.palette.mode === 'light' 
                        ? 'primary.medium' 
                        : 'secondary.main'
                  }
                }}
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
                borderColor: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'primary.medium'
                    : 'secondary.main',
                color: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'primary.medium'
                    : 'secondary.main',
                "&:hover": {
                  borderColor: (theme) => 
                    theme.palette.mode === 'light'
                      ? 'primary.medium'
                      : 'secondary.main',
                  backgroundColor: (theme) => 
                    theme.palette.mode === 'light'
                      ? 'rgba(66, 183, 129, 0.08)'
                      : 'rgba(65, 105, 225, 0.08)',
                },
                textTransform: "none",
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 500,
                borderRadius: 1.5,
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit" 
              fullWidth 
              disabled={loading}   
              sx={{
                background: (theme) => 
                  theme.palette.mode === 'light'
                    ? 'linear-gradient(45deg, rgba(50,135,97,1), rgba(66,183,129,0.9))'
                    : 'linear-gradient(45deg, rgba(65,105,225,1), rgba(65,105,225,0.8))',
                "&:hover": {
                  background: (theme) => 
                    theme.palette.mode === 'light'
                      ? 'linear-gradient(45deg, rgba(50,135,97,0.9), rgba(66,183,129,0.8))'
                      : 'linear-gradient(45deg, rgba(65,105,225,0.9), rgba(65,105,225,0.7))',
                },
                textTransform: "none",
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: 1.5,
                boxShadow: (theme) => 
                  theme.palette.mode === 'light'
                    ? '0 4px 12px rgba(66,183,129,0.2)'
                    : '0 4px 12px rgba(65,105,225,0.15)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
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
import React, { useState, useCallback, useEffect } from 'react';
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
  Button,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress, // Import CircularProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { GAMES } from '../../../utils/constants';
import { EventFields } from '../CreateLobbyModal/EventFields';
import formatDateForInputLocal from '../../../utils/formatDate';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function LobbyEditModal({ open, onClose, lobby }) {
  const [formData, setFormData] = useState({
    lobbyName: lobby?.lobbyName || '',
    gameId: lobby?.game || '',
    eventType: lobby?.lobbyType || 'normal',
    startTime: lobby.startTime ? formatDateForInputLocal(lobby.startTime) : '',
    endTime: lobby.endTime ? formatDateForInputLocal(lobby.endTime) : '',
    maxMembers: lobby?.maxMembers || 4,
    password: '',
  });

  useEffect(() => {
    if (lobby) {
      setFormData({
        lobbyName: lobby.lobbyName || '',
        gameId: lobby.game || '', // Adjust if necessary
        eventType: lobby.lobbyType || 'normal',
        startTime: lobby.startTime ? formatDateForInputLocal(lobby.startTime) : '',
        endTime: lobby.endTime ? formatDateForInputLocal(lobby.endTime) : '',
        maxMembers: lobby.maxMembers || 4,
        password: '',
      });
    }
  }, [lobby]); // Dependency array includes lobby
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false); 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true); // Start loading
    try {
      const token = localStorage.getItem('token');

      const startTimeISO = formData.startTime ? new Date(formData.startTime).toISOString() : null;
      const endTimeISO = formData.endTime ? new Date(formData.endTime).toISOString() : null;
      const response = await fetch(`http://localhost:3001/api/lobbies/update/${lobby.lobbyCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lobbyName: formData.lobbyName,
          game: formData.gameId,
          lobbyType: formData.eventType,
          startTime: startTimeISO,
          endTime: endTimeISO,
          maxMembers: formData.maxMembers,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lobby update failed');
      }

      await response.json();
      setSnackbar({ open: true, message: 'Lobby updated successfully!', severity: 'warning' });
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (error) {
      console.error('Lobby update error:', error);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false); // End loading regardless of success or failure
    }
  }, [formData, lobby.lobbyCode, onClose]);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(34,193,195,0.1) 0%, rgba(253,187,45,0.1) 100%)',
          border: '1px solid rgba(34,193,195,0.3)',
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
              Edit Lobby
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: 'rgba(34,193,195,0.8)' }} />
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 3 } }}>
          {/* Form fields as before */}
          <TextField
            fullWidth
            label="Lobby Name"
            name="lobbyName"
            value={formData.lobbyName}
            onChange={handleChange}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
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

          {/* Game Selection Area */}
          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel>Game Selection</InputLabel>
            <Select
              name="gameId"
              value={formData.gameId}
              onChange={handleChange}
              label="Game Selection"
              sx={{
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
                  {game.title}
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
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'rgba(34,193,195,1)', fontWeight: 600 }}>
              Event Type
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
                label="Normal"
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
                label="Event"
              />
            </RadioGroup>
          </Paper>

          {formData.eventType === 'event' && <EventFields formData={formData} handleChange={handleChange} />}

          <TextField
            fullWidth
            label="Max Members"
            name="maxMembers"
            type="number"
            value={formData.maxMembers}
            onChange={handleChange}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
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
            }}
          />
          <TextField
            fullWidth
            label="Lobby Password (Optional)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
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
              placeholder: 'Enter a new password or leave blank to keep current',
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              fullWidth
              disabled={loading} // Disable cancel button when loading
              sx={{
                borderColor: 'rgba(34,193,195,0.8)',
                color: 'rgba(34,193,195,1)',
                '&:hover': {
                  borderColor: 'rgba(34,193,195,1)',
                  backgroundColor: 'rgba(34,193,195,0.1)',
                },
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading} // Disable save button when loading
              sx={{
                background: 'linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))',
                '&:hover': {
                  background: 'linear-gradient(45deg, rgba(34,193,195,0.9), rgba(253,187,45,0.9))',
                },
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'} {/* Loading indicator */}
            </Button>
          </Box>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default LobbyEditModal;
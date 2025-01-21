import React from 'react';
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
} from '@mui/material';
import {
  Lock as LockIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
} from '@mui/icons-material';
import { GAMES } from '../utils/constants';
import { EventFields } from './EventFields';

const LobbyForm = ({ formData, handleChange, handleSubmit, onClose }) => (
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
          Create New Lobby
        </Typography>
      </Box>
    </Box>

    <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 3 } }}>
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
              {game.name}
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
  label="Max maxMembers"
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
    inputProps: { min: 1, max: 10 }, // Min ve max değerlerini belirleyin
  }}
/>
<TextField
  fullWidth
  label="Lobby Password (Optional)" // Opsiyonel olduğunu belirtmek için label güncellendi
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
    placeholder: 'Enter a password (optional)', // Placeholder ile opsiyonel olduğunu belirtme
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
          Create Lobby
        </Button>
      </Box>
    </Box>
  </Paper>
);

export default LobbyForm;
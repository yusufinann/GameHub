// src/components/MainScreen/CreateLobbyModal/EventFields.js
import React from 'react';
import { Box, TextField } from '@mui/material';

export const EventFields = ({ formData, handleChange }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
    <TextField
      fullWidth
      label="Başlangıç Zamanı"
      type="datetime-local"
      name="startTime"
      value={formData.startTime}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required
      InputProps={{
        sx: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'rgba(34,193,195,0.8)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(34,193,195,1)',
            },
          },
        },
      }}
    />
    <TextField
      fullWidth
      label="Bitiş Zamanı"   // Updated label
      type="datetime-local" // Changed to datetime-local
      name="endTime"        // Correct name: endTime
      value={formData.endTime}   // Correct value from formData.endTime
      onChange={handleChange}     // Correct handleChange
      InputLabelProps={{ shrink: true }}
      required
      InputProps={{
        sx: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'rgba(253,187,45,0.8)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(253,187,45,1)',
            },
          },
        },
      }}
    />
  </Box>
);
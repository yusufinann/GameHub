import React from 'react';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const EventFields = ({ formData, handleChange }) => {
  const { t } = useTranslation();
  
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
      <TextField
        fullWidth
        label={t("Start Time")}
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
        label={t("End Time")}
        type="datetime-local"
        name="endTime"
        value={formData.endTime}
        onChange={handleChange}
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
};

import React from 'react';
import { Box, TextField } from '@mui/material';

export const EventFields= ({ formData, handleChange }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
    <TextField
      label="Başlangıç Tarihi"
      type="date"
      name="startDate"
      value={formData.startDate}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required
    />
    <TextField
      label="Başlangıç Saati"
      type="time"
      name="startTime"
      value={formData.startTime}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required
    />
    <TextField
      label="Bitiş Tarihi"
      type="date"
      name="endDate"
      value={formData.endDate}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required
    />
    <TextField
      label="Bitiş Saati"
      type="time"
      name="endTime"
      value={formData.endTime}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required
    />
  </Box>
);
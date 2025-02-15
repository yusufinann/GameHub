// GameHistory.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { History } from '@mui/icons-material';

function GameHistory({ colorScheme }) {
  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 8px 32px rgba(34,193,195,0.1)',
      background: colorScheme.cardBg
    }}>
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: colorScheme.buttonGradient,
          color: 'white'
        }}>
          <History sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5">Game History</Typography>
        </Box>
        <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>2024-03-15</TableCell>
                <TableCell>850 Point</TableCell>
                <TableCell>
                  <Chip 
                    label="Kazandı" 
                    sx={{ background: 'linear-gradient(135deg, #22c1c3 0%, #2dccb0 100%)', color: 'white' }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-03-14</TableCell>
                <TableCell>450 Point</TableCell>
                <TableCell>
                  <Chip 
                    label="Kaybetti" 
                    sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', color: 'white' }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default GameHistory;
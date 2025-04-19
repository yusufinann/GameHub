import { createTheme } from '@mui/material/styles';
import { paletteTokens } from './palette';

export const buildTheme = (mode) =>
  createTheme({
    palette: { mode, ...paletteTokens[mode] },
    // typography, spacing, component defaults can go here
  });

export { paletteTokens };
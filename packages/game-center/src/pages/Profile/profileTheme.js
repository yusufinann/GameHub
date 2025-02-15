import { createTheme } from '@mui/material/styles';

export const profileTheme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50",
      dark: "#2E7D32",
      light: "#81C784",
    },
    secondary: {
      main: "#2196F3",
      dark: "#1565C0",
      light: "#64B5F6",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export const colorScheme = {
  gradientBg: "#81C784",
  cardBg: "rgba(255, 255, 255, 0.8)",
  accentGradient: "#4CAF50",
  buttonGradient: "#2E7D32",
  hoverGradient: "#81C784"
};
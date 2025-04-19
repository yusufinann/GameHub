import { createTheme } from '@mui/material/styles';
import { paletteTokens } from './palette';
import backgroundImage from '../assets/bg-green.png';
export const buildTheme = (mode) => {
  const palette = paletteTokens[mode];
  
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          body: {
            backgroundColor: themeParam.palette.background.default,
            // Light mode'da gradient/image eklemek isterseniz:
            ...(mode === 'light' && {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }),
          },
        }),
      },
    },
  });
};
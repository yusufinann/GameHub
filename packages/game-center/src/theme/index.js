import { createTheme } from '@mui/material/styles';
import { paletteTokens } from './palette';

export const buildTheme = (mode) => {
  const palette = paletteTokens[mode];

  return createTheme({
    palette: {
      mode: mode === 'neonOcean' ? 'light' : mode,
      ...palette,
    },
    
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => `
          body {
            /* Apply theme's default background color */
            background-color: ${themeParam.palette.background.default};
            /* Transition effect for smooth theme changes */
            transition: background-color 0.3s ease-in-out, background 0.3s ease-in-out;
            min-height: 100vh; /* Ensure page is at least screen height */
            margin: 0; /* Reset browser default margin */
            padding: 0; /* Reset browser default padding */
            width: 100vw; /* Full viewport width */
            font-family: ${themeParam.typography.fontFamily}; /* Apply default font for body */
            overflow-x: hidden; /* Prevent horizontal scrolling */

            /* Apply different backgrounds based on theme */
            ${mode === 'light'
              ? `
                 background: linear-gradient(135deg, #9cdeaf 0%, #42b781 100%);
                 background-attachment: fixed; /* Prevent background from scrolling */
                `
              : mode === 'dark'
              ? `
                 /* Dark mode background */
                 background-color: ${themeParam.palette.background.default};
                `
              : mode === 'neonOcean'
              ? `
                 /* neonOcean theme background */
                 background: ${themeParam.palette.background.default};
                 background-attachment: fixed;
                `
              : ''
            }
          }

          /* Scrollbar Styling with theme-specific colors */
          ::-webkit-scrollbar {
            width: 8px; /* Scrollbar width */
          }

          ::-webkit-scrollbar-track {
            background: ${mode === 'light' 
              ? `rgba(${parseInt(themeParam.palette.primary.main.slice(1, 3), 16)}, 
                ${parseInt(themeParam.palette.primary.main.slice(3, 5), 16)}, 
                ${parseInt(themeParam.palette.primary.main.slice(5, 7), 16)}, 0.1)`
              : mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : mode === 'neonOcean'
              ? `rgba(0, 255, 224, 0.1)` // Using neonOcean primary color
              : 'rgba(0, 0, 0, 0.1)'
            };
            border-radius: 4px; /* Rounded corners */
          }

          ::-webkit-scrollbar-thumb {
            background: ${themeParam.palette.primary.main}; /* Theme-specific scrollbar thumb color */
            border-radius: 4px; /* Rounded corners */
            transition: background 0.3s ease; /* Smooth transition effect */
          }

          ::-webkit-scrollbar-thumb:hover {
            background: ${themeParam.palette.primary.medium || themeParam.palette.primary.darker || themeParam.palette.primary.dark}; /* Hover state */
          }

          ::-webkit-scrollbar-thumb:active {
            background: ${themeParam.palette.primary.dark}; /* Active state */
          }

          /* Other global styles */
          * {
            box-sizing: border-box;
          }
        `,
      },
    },

    typography: {
      // General body text and default font family
      fontFamily: "'Exo 2', sans-serif", 
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontFamily: "'Exo 2', sans-serif",
      },
      body2: {
        fontSize: '0.9rem',
        lineHeight: 1.5,
        fontFamily: "'Exo 2', sans-serif",
      },
      // Headings
      h1: {
        fontFamily: "'Press Start 2P', cursive", 
        fontSize: '3rem',
        letterSpacing: '2px',
      },
      h2: {
        fontFamily: "'Orbitron', sans-serif", 
        fontWeight: 700,
        fontSize: '2.25rem',
        letterSpacing: '1.5px',
      },
      h3: {
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: '1.75rem',
      },
      h4: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '1.5rem',
      },
      h5: {
        fontFamily: "'Luckiest Guy', cursive", 
        fontSize: '1.25rem',
      },
      h6: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '1rem',
      },
    
      subtitle1: {
        fontFamily: "'VT323', monospace", 
        fontSize: '1.1rem',
      },
      subtitle2: {
        fontFamily: "'VT323', monospace",
        fontSize: '1rem',
      },
      button: {
        fontFamily: "'Press Start 2P', cursive",
        textTransform: 'none',
        fontSize: '0.9rem',
      },
      caption: {
        fontFamily: "'VT323', monospace",
        fontSize: '0.8rem',
      },
      overline: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '0.7rem',
        textTransform: 'none',
      },

      banner: {
        fontFamily: "'Righteous', cursive", 
        fontSize: '2.5rem',
        fontWeight: 400,
        letterSpacing: '-1px',
        textShadow: '0 4px 6px rgba(0,0,0,0.2)',
        display: 'inline-block',

        background: mode === 'neonOcean'
          ? `linear-gradient(
              45deg,
              ${palette.primary.light} 0%,
              ${palette.primary.main} 50%,
              ${palette.secondary.main} 100%
            )`
          : `linear-gradient(
              45deg,
              ${palette.primary.light} 0%,
              ${palette.primary.main} 50%,
              ${palette.secondary.main} 100%
            )`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      },
    },
  });
};
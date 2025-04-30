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
        styleOverrides: (themeParam) => `
          /* Google Fonts import */
          @import url('https://fonts.googleapis.com/css2?
            family=Exo+2:wght@400;600&  /* Gövde ve alt başlık */
            family=Press+Start+2P&      /* Büyük başlıklar */
            family=Orbitron:wght@700&   /* Orta başlıklar */
            family=VT323&               /* Skor/console hissi */
            display=swap
            family=Luckiest+Guy&display=swap');

          body {
            background-color: ${themeParam.palette.background.default};
            ${mode === 'light'
              ? `background-image: url(${backgroundImage});
                 background-size: cover;
                 background-position: center;`
              : ''}
          }
        `,
      },
    },
    typography: {
      // Genel gövde metni ve paragraf
      fontFamily: "'Exo 2', sans-serif",
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.9rem',
        lineHeight: 1.5,
      },
      // Başlıklar
      h1: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '3rem',
        letterSpacing: '2px',
      },
      h2: {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '2.25rem',
        letterSpacing: '1.5px',
      },
      h3: {
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.75rem',
      },
      h4: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '3rem',
      },
      h5: {
        fontFamily: "'Luckiest Guy', cursive",
        fontSize: '1.25rem',
      },
      h6: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '1rem',
      },
      // Ara metin, buton, etiket vb.
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
        fontWeight: 800,
        letterSpacing: '-1px',
        textShadow: '0 4px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      
        /* Tek background tanımı */
        background: `linear-gradient(
          45deg,
          ${palette.primary.light} 0%,
          ${palette.primary.main} 50%,
          ${palette.secondary.main} 100%
        )`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
      
    },
  });
};

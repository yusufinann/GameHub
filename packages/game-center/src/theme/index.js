import { createTheme } from '@mui/material/styles';
// paletteTokens'un doğru yoldan import edildiğini varsayıyoruz
import { paletteTokens } from './palette';
// Arka plan resmi importu - Başka bir yerde veya dark modda kullanılabilir.
import backgroundImage from '../assets/bg-green.png';

export const buildTheme = (mode) => {
  // Seçilen moda göre palet renklerini al
  const palette = paletteTokens[mode];

  // MUI createTheme fonksiyonu ile tema nesnesini oluştur
  return createTheme({
    // Renk paleti ayarları
    palette: {
      mode,       // 'light' veya 'dark'
      ...palette, // paletteTokens'dan gelen renkleri ekle
    },
    // Bileşen bazında stil özelleştirmeleri
    components: {
      // Global CSS sıfırlamaları ve temel stiller için
      MuiCssBaseline: {
        styleOverrides: (themeParam) => `
          /*
           * Google Fonts @import KURALI BURADA OLMAMALI!
           * Fontlar public/index.html içerisindeki <link> ile yükleniyor.
           */

          body {
            /* Temanın varsayılan arkaplan rengini uygula */
            background-color: ${themeParam.palette.background.default};
            /* Geçiş efekti (isteğe bağlı, tema değişimini yumuşatır) */
            transition: background-color 0.3s ease-in-out, background 0.3s ease-in-out;
            min-height: 100vh; /* Sayfanın en az ekran yüksekliğinde olmasını sağla */
            margin: 0; /* Tarayıcı varsayılan margin'ini sıfırla */
            font-family: ${themeParam.typography.fontFamily}; /* Body için varsayılan fontu uygula */

            /* Sadece light modda gradient arka plan uygula */
            ${mode === 'light'
              ? `
                 background: linear-gradient(135deg, #9cdeaf 0%, #42b781 100%);
                 background-attachment: fixed; /* Arka planın kaymasını engelle */
                `
              : `
                 /* Dark mod için farklı bir arka plan veya sadece renk isterseniz buraya ekleyin */
                 /* Örneğin: background-image: url(${backgroundImage}); */
                 /* Veya sadece koyu renk: background-color: ${themeParam.palette.background.default}; */
                `
            }
          }

          /* Diğer global stiller (gerekirse) */
          * {
            box-sizing: border-box; /* Genellikle MuiCssBaseline zaten yapar */
          }
        `,
      },
      // Diğer MUI bileşenleri için override'lar buraya eklenebilir
      // Örn: MuiButton, MuiAppBar vb.
    },
    // Tipografi (Yazı Tipi) Ayarları
    typography: {
      /*
       * Font aileleri burada tanımlanır. Fontların kendisi index.html'den yüklenir.
       */

      // Genel gövde metni ve varsayılan font ailesi
      fontFamily: "'Exo 2', sans-serif", // index.html'de yüklendi
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontFamily: "'Exo 2', sans-serif", // Gerekirse tekrar belirtilebilir
      },
      body2: {
        fontSize: '0.9rem',
        lineHeight: 1.5,
        fontFamily: "'Exo 2', sans-serif",
      },
      // Başlıklar
      h1: {
        fontFamily: "'Press Start 2P', cursive", // index.html'de yüklendi
        fontSize: '3rem',
        letterSpacing: '2px',
      },
      h2: {
        fontFamily: "'Orbitron', sans-serif", // index.html'de yüklendi (700 weight ile)
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
        // 3rem h1 ile aynı, genellikle h4 daha küçük olur. Ayarlandı:
        fontSize: '1.5rem',
      },
      h5: {
        fontFamily: "'Luckiest Guy', cursive", // index.html'de yüklendi
        fontSize: '1.25rem',
      },
      h6: {
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '1rem',
      },
      // Diğer metin türleri
      subtitle1: {
        fontFamily: "'VT323', monospace", // index.html'de yüklendi
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
      // Özel 'banner' tipografi varyantı
      banner: {
        fontFamily: "'Righteous', cursive", // index.html'de yüklendi
        fontSize: '2.5rem',
        // Righteous genellikle sadece 400 ağırlığında gelir. 800 yerine 400 kullanmak daha doğru.
        fontWeight: 400,
        letterSpacing: '-1px',
        textShadow: '0 4px 6px rgba(0,0,0,0.2)',
        // display: flex yerine inline-block daha esnek olabilir veya hiç belirtmeyebilirsiniz.
        display: 'inline-block',
        // gap: '12px', // display: flex olmadan gap çalışmaz.

        /* Gradient metin rengi */
        background: `linear-gradient(
          45deg,
          ${palette.primary.light} 0%,
          ${palette.primary.main} 50%,
          ${palette.secondary.main} 100%
        )`,
        WebkitBackgroundClip: 'text', // Gradyanı metne uygula (WebKit)
        backgroundClip: 'text',      // Gradyanı metne uygula (Standart)
        WebkitTextFillColor: 'transparent', // Metnin rengini şeffaf yap (WebKit)
        color: 'transparent', // Metnin rengini şeffaf yap (Standart)
      },
    },
  });
};
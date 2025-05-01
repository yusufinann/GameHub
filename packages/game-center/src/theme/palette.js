// --- Light Theme Color Variables ---
const lightPrimaryMain = "#2b8a6a";
const lightPrimaryLight = "#4eca99";
const lightPrimaryMedium = "#35a583";
const lightPrimaryDarker = "#257258";
const lightPrimaryDark = "#1e5c46";

const lightSecondaryMain = "#3f88c5";
const lightSecondaryLight = "#7bb2de";
const lightSecondaryPaper = "#d9e8f5";
const lightSecondaryDark = "#2d5e8a";
const lightSecondaryGold = "#FFD700";
const lightShiningGold = "#fff08c"; 

const lightBackgroundDefault = "#e0f5ea";
const lightBackgroundPaper = "#ffffff";
const lightBackgroundApp = "#e8f5f0";
const lightBackgroundCard = "#f1f9f6";

const lightTextPrimary = "#2d3748";
const lightTextSecondary = "#4a5568";
const lightTextContrast = "#FFFFFF";
const lightTextDisabled = "rgba(74,85,104,0.38)";

const lightErrorMain = "#e53e3e";
const lightErrorLight = "#fc8181";
const lightErrorDark = "#c53030";

const lightWarningMain = "#ed8936";
const lightWarningLight = "#f6ad55";

// --- Dark Theme Color Variables ---
const darkPrimaryMain = "#1d2e4a"; // Koyu Mavi-Gri Ana
const darkPrimaryLight = "#2d4368"; // Açık tonu
const darkPrimaryMedium = "#162339"; // Orta tonu (daha koyu)
const darkPrimaryDarker = "#11192b"; // Daha koyu
const darkPrimaryDark = "#0b1018";  // En koyu

const darkSecondaryMain = "#4169e1"; // Royal Blue (RGBA'dan HEX'e çevrildi)
const darkSecondaryLight = "rgba(65, 105, 225, 0.85)"; // Yarı saydam Royal Blue
const darkSecondaryPaper = "#2c5282"; // Koyu Mavi-Gri Kağıt
const darkSecondaryDark = "#283593"; // Indigo'ya yakın Koyu Mavi
const darkSecondaryGold = "#FFD700"; // Klasik Altın

const darkBackgroundDefault = "#0f1924"; // Çok Koyu Mavi-Siyah Arka Plan
const darkBackgroundPaper = "#2d3748"; // Gri-Mavi Kağıt
const darkBackgroundApp = "rgb(26, 54, 93)"; // Koyu Mavi Uygulama Arka Planı
const darkBackgroundCard = "rgb(37, 64, 103)"; // Daha Açık Koyu Mavi Kart

const darkTextPrimary = "rgba(255, 255, 255, 0.9)"; // Neredeyse Beyaz
const darkTextSecondary = "rgba(255, 255, 255, 0.7)"; // Daha Gri Beyaz
const darkTextContrast = "#FFFFFF";
const darkTextDisabled = "rgba(255,255,255,0.38)";

const darkErrorMain = "#f56565"; // Açık Kırmızı
const darkErrorLight = "#fc8181"; // Daha Açık Kırmızı
const darkErrorDark = "#e53e3e"; // Orta Kırmızı

const darkWarningMain = "#ed8936"; // Turuncu (Light ile aynı)
const darkWarningLight = "rgba(237, 137, 54, 0.85)"; // Yarı saydam Turuncu

const darkInfoMain = "#4299e1"; // Açık Mavi
const darkInfoLight = "#63b3ed"; // Daha Açık Mavi
const darkInfoDark = "#3182ce"; // Orta Mavi

const darkSuccessMain = "#48bb78"; // Yeşil
const darkSuccessLight = "#68d391"; // Açık Yeşil
const darkSuccessDark = "#38a169"; // Koyu Yeşil

export const paletteTokens = {
  light: {
    primary: {
      main: lightPrimaryMain,
      light: lightPrimaryLight,
      medium: lightPrimaryMedium,
      darker: lightPrimaryDarker,
      dark: lightPrimaryDark,
      text: lightTextContrast, 
      contrastText: lightTextContrast,
    },
    secondary: {
      main: lightSecondaryMain,
      light: lightSecondaryLight,
      paper: lightSecondaryPaper,
      dark: lightSecondaryDark,
      gold: lightSecondaryGold,
      contrastText: lightTextContrast,
    },
    background: {
      default: lightBackgroundDefault,
      paper: lightBackgroundPaper,
      offwhite: "rgba(255,255,255,0.92)",
      dot: `rgba(${parseInt(lightPrimaryMain.slice(1, 3), 16)}, ${parseInt(lightPrimaryMain.slice(3, 5), 16)}, ${parseInt(lightPrimaryMain.slice(5, 7), 16)}, 0.1)`, // Ana renkten türetildi
      app: lightBackgroundApp,
      card: lightBackgroundCard,
      gradient: `linear-gradient(135deg, #d5f2e3 0%, ${lightPrimaryLight} 100%)`,
      gradientB: `linear-gradient(135deg, rgba(${parseInt(lightPrimaryMain.slice(1, 3), 16)}, ${parseInt(lightPrimaryMain.slice(3, 5), 16)}, ${parseInt(lightPrimaryMain.slice(5, 7), 16)}, 0.05) 0%, rgba(${parseInt(lightPrimaryLight.slice(1, 3), 16)}, ${parseInt(lightPrimaryLight.slice(3, 5), 16)}, ${parseInt(lightPrimaryLight.slice(5, 7), 16)}, 0.1) 100%)`, // Ana ve açık renkten türetildi
      stripeBg: `repeating-linear-gradient(45deg, ${lightPrimaryMain}60, ${lightPrimaryMain}60 10px, ${lightPrimaryLight}30 10px, ${lightPrimaryLight}30 20px)`,
      gradientFadeBg: `linear-gradient(135deg, ${lightPrimaryDark}90 0%, transparent 40%, transparent 60%, ${lightPrimaryDark}80 100%)`,
      elevation: {
        1: `rgba(${parseInt(lightPrimaryMain.slice(1, 3), 16)}, ${parseInt(lightPrimaryMain.slice(3, 5), 16)}, ${parseInt(lightPrimaryMain.slice(5, 7), 16)}, 0.05)`,
        2: `rgba(${parseInt(lightPrimaryMain.slice(1, 3), 16)}, ${parseInt(lightPrimaryMain.slice(3, 5), 16)}, ${parseInt(lightPrimaryMain.slice(5, 7), 16)}, 0.08)`,
        3: `rgba(${parseInt(lightPrimaryMain.slice(1, 3), 16)}, ${parseInt(lightPrimaryMain.slice(3, 5), 16)}, ${parseInt(lightPrimaryMain.slice(5, 7), 16)}, 0.12)`,
      }
    },
    text: {
      primary: lightTextPrimary,
      secondary: lightTextSecondary,
      contrast: lightTextContrast,
      gradient: `linear-gradient(45deg, ${lightSecondaryGold} 50%, ${lightShiningGold} 100%)`,
      disabled: lightTextDisabled,
      title: `linear-gradient(45deg, ${lightPrimaryMain}, ${lightPrimaryMedium})`
    },
    error: {
      main: lightErrorMain,
      light: lightErrorLight,
      dark: lightErrorDark,
      contrastText: lightTextContrast
    },
    warning: {
      main: lightWarningMain,
      light: lightWarningLight,
      contrastText: lightTextContrast 
    },
    info: {
      main: lightSecondaryMain,
      light: lightSecondaryLight,
      dark: lightSecondaryDark,
      contrastText: lightTextContrast
    },
    success: {
      main: lightPrimaryMain,
      medium: lightPrimaryMedium,
      light: lightPrimaryLight,
      contrastText: lightTextContrast
    },
  },
  dark: {
    primary: {
      main: darkPrimaryMain,
      light: darkPrimaryLight,
      medium: darkPrimaryMedium, 
      darker: darkPrimaryDarker,
      dark: darkPrimaryDark,
      text: darkTextContrast,
      contrastText: darkTextContrast,
    },
    secondary: {
      main: darkSecondaryMain,
      light: darkSecondaryLight,
      paper: darkSecondaryPaper,
      dark: darkSecondaryDark,
      gold: darkSecondaryGold,
      contrastText: darkTextContrast,
    },
    background: {
      default: darkBackgroundDefault,
      paper: darkBackgroundPaper,
      offwhite: "rgba(255,255,255,0.12)",
      dot: "rgba(255,255,255,0.3)",
      app: darkBackgroundApp,
      card: darkBackgroundCard,
      gradient: `linear-gradient(135deg, #1a202c 0%, ${darkPrimaryMain} 100%)`,
      gradientB: "linear-gradient(135deg, rgba(23, 39, 64, 0.9) 50%, rgba(44, 74, 120, 0.9) 100%)",
      stripeBg: `repeating-linear-gradient(45deg, ${darkPrimaryMain}60, ${darkPrimaryMain}60 10px, ${darkPrimaryLight}30 10px, ${darkPrimaryLight}30 20px)`,
     
      gradientFadeBg: `linear-gradient(135deg, ${darkPrimaryDark}90 0%, transparent 40%, transparent 60%, ${darkPrimaryDark}80 100%)`,
      elevation: {
        1: "rgba(0,0,0,0.2)",
        2: "rgba(0,0,0,0.3)",
        3: "rgba(0,0,0,0.4)",
      }
    },
    text: {
      primary: darkTextPrimary,
      secondary: darkTextSecondary,
      contrast: darkTextContrast,
      gradient: `linear-gradient(45deg, ${darkSecondaryMain} 0%, ${darkPrimaryLight} 100%)`, // RoyalBlue -> Açık Koyu Mavi-Gri
      disabled: darkTextDisabled,
      title: `linear-gradient(45deg, ${darkSecondaryMain}, ${darkInfoLight})` // RoyalBlue -> Daha Açık Mavi (#63b3ed)
    },
    error: {
      main: darkErrorMain,
      light: darkErrorLight,
      dark: darkErrorDark,
      contrastText: darkTextContrast
    },
    warning: {
      main: darkWarningMain,
      light: darkWarningLight,
      contrastText: darkTextContrast // Kontrastı sağlamak için #1A202C gibi koyu bir renk de düşünülebilir
    },
    info: {
      main: darkInfoMain,
      light: darkInfoLight,
      dark: darkInfoDark,
      contrastText: darkTextContrast
    },
    success: {
      main: darkSuccessMain,
      light: darkSuccessLight,
      dark: darkSuccessDark, 
      contrastText: darkTextContrast
    },
  },
};
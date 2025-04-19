export const paletteTokens = {
  light: {
    primary: {
      main: "#3f51b5",
      light: "#81C784",
      medium: "#42b781", //"medium" renk
      darker: "#3a9f71", // "darker" renk
      dark: "#328761",   //Highlights price kısmı
      text: "#81C784",
    },
    secondary: {
      main: "rgba(38, 166, 154, 1)", //mavi tonu 
      light: "rgba(38, 166, 154, 0.85)",
      paper:"#7cccc4",
      dark: "#c51162",
      gold: "#FFD700",
      contrastText: "#fff", 
    },
    background: {
      default: "#caecd5",  //sidebar rengi
      paper: "#fff",
      offwhite: "rgba(255,255,255,0.85)",  //kırık beyaz
      dot:"rgba(255,255,255,0.5)",
      app: "rgb(157,222,175)",
      card: "rgb(175,230,190)",
      gradient: "linear-gradient(135deg, #caecd5 0%, rgb(50,135,97) 100%)", //noActiveLobby bg
      gradientB: "linear-gradient(135deg, rgba(50,135,97,0.9) 50%, rgba(202,236,213,0.9) 100%)",
      stripeBg:'rgb(50,135,97)',
      stripe:"repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)"
    },
    text: {
      primary: "rgba(0, 0, 0, 1)",
      secondary: "rgba(0, 0, 0, 0.8)",
      contrast: "white",
      gradient:'linear-gradient(45deg, #ff6b6b 0%,rgb(78, 205, 133) 100%)',
      disabled: "rgba(0,0,0,0.38)",
      title:"linear-gradient(45deg,rgb(218, 31, 31), #ff8e53)"
    },
    error: { main: "#f44336" },
    warning: { main: "rgba(255, 180, 0, 1)" ,light:"rgba(255, 123, 0, 0.85)"},
    info: { main: "#2196f3" },
    success: { main: "#2E7D32",medium:"#4c9f38", light:"#4caf50" },
  },
  dark: {
    primary: {
      main: "#1d2e4a",      // Ana koyu mavi renk
      light: "#2d4368",     // Daha açık koyu mavi
      medium: "#162339",    // Orta koyu mavi
      darker: "#11192b",    // Daha koyu mavi
      dark: "#0b1018",      // En koyu mavi/siyah
      text: "#fff",
    },
    secondary: {
      main: "rgba(65, 105, 225, 1)", // Mavi tonu (Royal Blue)
      light: "rgba(65, 105, 225, 0.85)",
      paper: "#2c5282",
      dark: "#283593",
      gold: "#FFD700",
      contrastText: "#fff",
    },
    background: {
     // default: "#1a202c",   // Sidebar rengi - koyu gri/mavi
      default: "#0f1924",
      paper: "#2d3748",     // Daha açık koyu gri
      offwhite: "rgba(255,255,255,0.12)", // Koyu tema için soluk beyaz
      dot: "rgba(255,255,255,0.3)",
      app: "rgb(26, 54, 93)",
      card: "rgb(37, 64, 103)",
      gradient: "linear-gradient(135deg, #1a202c 0%, #1d2e4a 100%)", // noActiveLobby bg
      gradientB: "linear-gradient(135deg, rgba(23, 39, 64, 0.9) 50%, rgba(44, 74, 120, 0.9) 100%)",
      stripeBg: "#1d2e4a",
      stripe: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px)"
    },
    text: {
      primary: "rgba(255, 255, 255, 0.9)",
      secondary: "rgba(255, 255, 255, 0.7)",
      contrast: "white",
      gradient: 'linear-gradient(45deg, #4169e1 0%, #1d2e4a 100%)',
      disabled: "rgba(255,255,255,0.38)",
      title: "linear-gradient(45deg, #4169e1, #63b3ed)"
    },
    error: { main: "#f56565" },
    warning: { main: "#ed8936", light: "rgba(237, 137, 54, 0.85)" },
    info: { main: "#4299e1" },
    success: { main: "#48bb78", light: "#68d391" },
  },
};
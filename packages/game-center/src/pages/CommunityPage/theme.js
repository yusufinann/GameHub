import { createTheme } from "@mui/material";

const createAppTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#FF5722" : "#FF3D00", // Vibrant orange
        light: mode === "dark" ? "#FF8A65" : "#FF7043",
        dark: mode === "dark" ? "#E64A19" : "#DD2C00",
        contrastText: "#FFF",
      },
      secondary: {
        main: mode === "dark" ? "#18FFFF" : "#00B8D4", // Cyan
        light: mode === "dark" ? "#84FFFF" : "#18FFFF",
        dark: mode === "dark" ? "#00E5FF" : "#00B8D4",
        contrastText: mode === "dark" ? "#000" : "#FFF",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#F5F5F5",
        paper: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#FFFFFF" : "#212121",
        secondary: mode === "dark" ? "#B0B0B0" : "#757575",
      },
      success: {
        main: "#00E676",
      },
      info: {
        main: "#2979FF",
      },
      warning: {
        main: "#FFAB00",
      },
      error: {
        main: "#FF1744",
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
        letterSpacing: "0.02em",
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px 0 rgba(0,0,0,0.2)",
            },
          },
          containedPrimary: {
            "&:hover": {
              backgroundColor: mode === "dark" ? "#FF7043" : "#FF5722",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              mode === "dark"
                ? "0 8px 16px rgba(0,0,0,0.4)"
                : "0 6px 12px rgba(0,0,0,0.05)",
            overflow: "hidden",
            transition:
              "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                mode === "dark"
                  ? "0 12px 20px rgba(0,0,0,0.5)"
                  : "0 12px 24px rgba(0,0,0,0.1)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "dark"
                ? "0 4px 8px rgba(0,0,0,0.5)"
                : "0 2px 8px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            textTransform: "none",
            fontSize: "1rem",
          },
        },
      },
    },
  });
};

// Color schemes for different post types/reactions
export const postColors = [
  {
    gradient: "linear-gradient(135deg, #FF9D6C 0%, #FF5722 100%)",
    border: "#FF5722",
  },
  {
    gradient: "linear-gradient(135deg, #6EFFFF 0%, #00B8D4 100%)",
    border: "#00B8D4",
  },
  {
    gradient: "linear-gradient(135deg, #B388FF 0%, #7C4DFF 100%)",
    border: "#7C4DFF",
  },
  {
    gradient: "linear-gradient(135deg, #84FFFF 0%, #00E5FF 100%)",
    border: "#00E5FF",
  },
  {
    gradient: "linear-gradient(135deg, #69F0AE 0%, #00C853 100%)",
    border: "#00C853",
  },
];

// Helper function for formatting timestamps
export const formatTimestamp = (timestamp) => {
  const now = new Date().getTime();
  const diff = now - timestamp;

  // Less than a minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

export default createAppTheme;
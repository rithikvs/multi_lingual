import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // Neon blue glow matching Tailwind accentBlue
      light: '#7dd3fc',
      dark: '#0284c7',
    },
    secondary: {
      main: '#10b981', // Emerald green highlights matching Tailwind accentGreen
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444', // Red glow matching Tailwind accentRed (SOS)
    },
    background: {
      default: '#0f172a', // deep Slate blue-black matching Tailwind darkBg
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc', // slate 50
      secondary: '#94a3b8', // slate 400
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none',
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
          borderRadius: '12px',
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

export default muiTheme;

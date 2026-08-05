import { alpha, createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d6e6e',
      dark: '#0b525b',
      light: '#4fb3ad',
      contrastText: '#f7fbfb',
    },
    secondary: {
      main: '#f18f01',
      dark: '#c96a00',
      light: '#ffbd59',
      contrastText: '#1f1300',
    },
    background: {
      default: '#f4f1ea',
      paper: '#fffdf9',
    },
    text: {
      primary: '#1f2933',
      secondary: '#52606d',
    },
    divider: alpha('#0f172a', 0.08),
    success: {
      main: '#2f855a',
    },
    warning: {
      main: '#dd6b20',
    },
    error: {
      main: '#c53030',
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.8rem',
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontSize: '1.4rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.98rem',
      lineHeight: 1.7,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top left, rgba(13, 110, 110, 0.18), transparent 25%), linear-gradient(180deg, #f8f6f0 0%, #f1ede5 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha('#0f172a', 0.06)}`,
          transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.10)',
          paddingInline: 20,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#102a43',
          borderRadius: 12,
          fontSize: '0.8rem',
          padding: '10px 12px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #12343b 0%, #0d1f2d 100%)',
          color: '#f5efe6',
          borderRight: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: alpha('#fffdf9', 0.82),
          backdropFilter: 'blur(18px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha('#0f172a', 0.08)}`,
        },
      },
    },
  },
})

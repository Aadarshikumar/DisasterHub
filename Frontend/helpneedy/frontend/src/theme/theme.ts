import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

// Custom Crisis Urgency Color Palette
export const urgencyColors = {
  critical: {
    main: '#DC2626',      // Alert Red
    light: '#FEE2E2',
    dark: '#991B1B',
    contrastText: '#FFFFFF',
    border: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.08)',
    glow: '0 0 15px rgba(220, 38, 38, 0.4)',
  },
  urgent: {
    main: '#D97706',      // Emergency Amber/Orange
    light: '#FEF3C7',
    dark: '#92400E',
    contrastText: '#FFFFFF',
    border: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.08)',
    glow: '0 0 12px rgba(217, 119, 6, 0.35)',
  },
  normal: {
    main: '#059669',      // Emerald Green
    light: '#D1FAE5',
    dark: '#065F46',
    contrastText: '#FFFFFF',
    border: '#10B981',
    bgLight: 'rgba(16, 185, 129, 0.08)',
    glow: '0 0 10px rgba(5, 150, 105, 0.25)',
  },
};

export const getAppTheme = (mode: 'light' | 'dark' = 'light') => {
  const isDark = mode === 'dark';

  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#0284C7', // Sky Blue / Disaster Aid Blue
        light: '#38BDF8',
        dark: '#0369A1',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#4F46E5', // Indigo
        light: '#818CF8',
        dark: '#3730A3',
      },
      error: {
        main: urgencyColors.critical.main,
        light: urgencyColors.critical.light,
        dark: urgencyColors.critical.dark,
      },
      warning: {
        main: urgencyColors.urgent.main,
        light: urgencyColors.urgent.light,
        dark: urgencyColors.urgent.dark,
      },
      success: {
        main: urgencyColors.normal.main,
        light: urgencyColors.normal.light,
        dark: urgencyColors.normal.dark,
      },
      info: {
        main: '#0284C7',
      },
      background: {
        default: isDark ? '#0B1120' : '#F8FAFC',
        paper: isDark ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F1F5F9' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    typography: {
      fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'].join(','),
      h1: {
        fontFamily: ['Outfit', 'Inter', 'sans-serif'].join(','),
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: ['Outfit', 'Inter', 'sans-serif'].join(','),
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontFamily: ['Outfit', 'Inter', 'sans-serif'].join(','),
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontFamily: ['Outfit', 'Inter', 'sans-serif'].join(','),
        fontWeight: 600,
      },
      h5: {
        fontFamily: ['Outfit', 'Inter', 'sans-serif'].join(','),
        fontWeight: 600,
      },
      h6: {
        fontFamily: ['Outfit', 'Inter', 'sans-serif'].join(','),
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 10,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            fontSize: '0.95rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          },
          contained: {
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: isDark 
              ? '0 4px 20px rgba(0,0,0,0.4)' 
              : '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? alpha('#0F172A', 0.85) : alpha('#FFFFFF', 0.85),
            backdropFilter: 'blur(12px)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'none',
            color: isDark ? '#F8FAFC' : '#0F172A',
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};

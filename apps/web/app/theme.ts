'use client';

import { createTheme } from '@mui/material/styles';

/**
 * KSL Learning Platform — Material Design Theme
 * 
 * Cambodian color palette:
 * - Deep Red (#C0392B) — Sign Language track
 * - Gold (#F1C40F) — Accent & highlights
 * - Cool Blue/Teal — Finger Spelling track
 * - Neutral grays — UI elements
 */

export const kslTheme = createTheme({
  palette: {
    primary: {
      main: '#C0392B', // Deep red (Sign Language)
      light: '#E74C3C',
      dark: '#A93226',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F1C40F', // Gold (accent)
      light: '#F4D03F',
      dark: '#D4AF37',
      contrastText: '#000000',
    },
    // Track-specific colors
    fingerSpelling: {
      main: '#2980B9', // Cool blue
      light: '#3498DB',
      dark: '#1F618D',
    },
    success: {
      main: '#27AE60',
      light: '#2ECC71',
      dark: '#1E8449',
    },
    warning: {
      main: '#E67E22',
      light: '#F39C12',
      dark: '#BA4A00',
    },
    error: {
      main: '#C0392B',
      light: '#E74C3C',
      dark: '#A93226',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#171717',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: [
      "'Noto Sans Khmer'",
      "'Inter'",
      "'system-ui'",
      "'-apple-system'",
      "'Segoe UI'",
      "'Roboto'",
      "'Helvetica'",
      "'Arial'",
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
      color: '#171717',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.25px',
      color: '#171717',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#171717',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#171717',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#171717',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#171717',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#171717',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6B7280',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.5px',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#9CA3AF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8, // 8px base unit
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '0.95rem',
          fontWeight: 600,
          padding: '0.625rem 1.25rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        outlined: {
          borderColor: '#D1D5DB',
          color: '#171717',
          '&:hover': {
            backgroundColor: '#F3F4F6',
            borderColor: '#9CA3AF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 8,
          },
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#C0392B',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#C0392B',
              boxShadow: '0 0 0 3px rgba(192, 57, 43, 0.1)',
            },
          },
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
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Custom color extending (for TypeScript)
declare module '@mui/material/styles' {
  interface Palette {
    fingerSpelling: {
      main: string;
      light: string;
      dark: string;
    };
  }
  interface PaletteOptions {
    fingerSpelling?: {
      main?: string;
      light?: string;
      dark?: string;
    };
  }
}

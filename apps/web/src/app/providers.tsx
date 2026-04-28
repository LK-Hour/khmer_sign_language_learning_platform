'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { kslTheme } from '@/app/theme';

type ThemeProvidersProps = {
  children: ReactNode;
};

export function ThemeProviders({ children }: ThemeProvidersProps): JSX.Element {
  return (
    <ThemeProvider theme={kslTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

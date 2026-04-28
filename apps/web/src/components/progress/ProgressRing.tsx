'use client';

import React from 'react';
import { Box, Typography, CircularProgress, CircularProgressProps } from '@mui/material';

export interface ProgressRingProps extends CircularProgressProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  subLabel?: string;
}

/**
 * Circular progress indicator with optional label
 * Used to display completion percentage for units/sections
 */
export function ProgressRing({
  value,
  size = 120,
  label,
  subLabel,
  ...props
}: ProgressRingProps): JSX.Element {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={4}
        sx={{
          color: value >= 100 ? 'success.main' : 'primary.main',
        }}
        {...props}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          color="textPrimary"
          sx={{ fontWeight: 700 }}
        >
          {Math.round(value)}%
        </Typography>
        {label && (
          <Typography
            variant="caption"
            component="div"
            color="textSecondary"
          >
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

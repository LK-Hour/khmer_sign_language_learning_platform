'use client';

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

export interface LockOverlayProps {
  isLocked: boolean;
  tooltipText?: string;
  children: React.ReactNode;
}

/**
 * Overlay component that shows a lock icon when content is locked
 * Prevents interactions with locked content
 */
export function LockOverlay({
  isLocked,
  tooltipText = 'This content is locked',
  children,
}: LockOverlayProps): JSX.Element {
  if (!isLocked) {
    return <>{children}</>;
  }

  const content = (
    <Box
      sx={{
        position: 'relative',
        opacity: 0.6,
        pointerEvents: 'none',
      }}
    >
      {children}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 1,
        }}
      >
        <LockOutlined
          sx={{
            fontSize: 48,
            color: 'text.secondary',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Tooltip title={tooltipText}>
      <div>{content}</div>
    </Tooltip>
  );
}

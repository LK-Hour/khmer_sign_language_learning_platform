'use client';

import React from 'react';
import { Card, CardContent, CardHeader, LinearProgress, Box, Typography, Tooltip } from '@mui/material';
import Link from 'next/link';
import { LockOutlined } from '@mui/icons-material';
import type { UnitListItem } from '@ksl/shared';

export interface UnitCardProps {
  unit: UnitListItem;
  isLocked?: boolean;
  lockedTooltip?: string;
}

/**
 * Card component for displaying a unit in the learning dashboard
 * Shows progress, completion status, and lock state
 */
export function UnitCard({
  unit,
  isLocked = false,
  lockedTooltip = 'Complete the previous unit to unlock this one',
}: UnitCardProps): JSX.Element {
  const progress = unit.progressPercent ?? 0;

  const content = (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
          transform: isLocked ? 'none' : 'translateY(-4px)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      <CardHeader
        title={unit.title}
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="textSecondary">
              Progress
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      </CardContent>

      {isLocked && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            backdropFilter: 'blur(2px)',
          }}
        >
          <LockOutlined sx={{ fontSize: 40, color: 'text.secondary' }} />
        </Box>
      )}
    </Card>
  );

  if (isLocked) {
    return (
      <Tooltip title={lockedTooltip}>
        <div>{content}</div>
      </Tooltip>
    );
  }

  return (
    <Link href={`/sign-language/units/${unit.id}`} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}

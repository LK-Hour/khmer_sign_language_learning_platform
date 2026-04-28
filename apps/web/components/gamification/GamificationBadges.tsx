'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalFireDepartmentOutlined } from '@mui/icons-material';
import { IconBadge } from '@/components/ui/TranslatedIcon';

export interface StreakBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Badge component displaying current streak with fire icon
 */
export function StreakBadge({ count, size = 'medium' }: StreakBadgeProps): JSX.Element {
  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
      }}
    >
      <IconBadge
        iconKey="streak"
        text={`${count}-day streak`}
        label="Current streak"
        size={iconSize}
        color="error"
        variant="filled"
      />
    </Box>
  );
}

export interface XPBadgeProps {
  xp: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Badge component displaying total XP with star icon
 */
export function XPBadge({ xp, size = 'medium' }: XPBadgeProps): JSX.Element {
  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
        color: '#333',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
      }}
    >
      <IconBadge
        iconKey="xp"
        text={`${xp} XP`}
        label="Total experience points"
        size={iconSize}
        color="primary"
        variant="filled"
      />
    </Box>
  );
}

export interface BadgeCountProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Badge component displaying earned badges count with trophy icon
 */
export function BadgeCountBadge({ count, size = 'medium' }: BadgeCountProps): JSX.Element {
  const iconSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium';

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
      }}
    >
      <IconBadge
        iconKey="badge"
        text={`${count} badges`}
        label="Earned badges"
        size={iconSize}
        color="success"
        variant="filled"
      />
    </Box>
  );
}

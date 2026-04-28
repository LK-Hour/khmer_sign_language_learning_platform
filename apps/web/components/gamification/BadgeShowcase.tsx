'use client';

import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  earnedAt?: Date;
}

export interface BadgeShowcaseProps {
  badges: BadgeInfo[];
  emptyMessage?: string;
  columns?: number;
  size?: 'small' | 'medium' | 'large';
}

/**
 * CSS Grid-based showcase component for displaying earned achievement badges
 */
export function BadgeShowcase({
  badges,
  emptyMessage = 'No badges earned yet. Keep learning!',
  columns = 4,
  size = 'medium',
}: BadgeShowcaseProps): JSX.Element {
  const iconSize =
    size === 'small' ? 32 : size === 'large' ? 64 : 48;

  if (badges.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
      }}
    >
      {badges.map((badge) => (
        <Tooltip key={badge.id} title={badge.description} placement="top">
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: badge.color || 'action.hover',
              border: '2px solid transparent',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 3,
                borderColor: 'primary.main',
              },
            }}
            elevation={1}
          >
            {badge.icon ? (
              <Box sx={{ fontSize: iconSize, lineHeight: 1, mb: 1 }}>
                {badge.icon}
              </Box>
            ) : (
              <EmojiEventsIcon
                sx={{
                  fontSize: iconSize,
                  color: 'primary.main',
                  mb: 1,
                }}
              />
            )}
            <Typography
              variant={size === 'small' ? 'caption' : 'body2'}
              align="center"
              sx={{ fontWeight: 600 }}
            >
              {badge.name}
            </Typography>
            {badge.earnedAt && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 0.5 }}
              >
                {new Date(badge.earnedAt).toLocaleDateString()}
              </Typography>
            )}
          </Paper>
        </Tooltip>
      ))}
    </Box>
  );
}

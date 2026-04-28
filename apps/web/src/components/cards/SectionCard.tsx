'use client';

import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography, Tooltip, Chip } from '@mui/material';
import Link from 'next/link';
import { LockOutlined, PlayArrowOutlined } from '@mui/icons-material';
import type { SectionListItem } from '@ksl/shared';

export interface SectionCardProps {
  section: SectionListItem;
  isLocked?: boolean;
  lockedTooltip?: string;
}

/**
 * Card component for displaying a section in the finger spelling track
 */
export function SectionCard({
  section,
  isLocked = false,
  lockedTooltip = 'Complete the previous section to unlock this one',
}: SectionCardProps): JSX.Element {
  const progress = section.progressPercent ?? 0;

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
        title={section.title}
        avatar={
          !isLocked && (
            <PlayArrowOutlined sx={{ color: 'primary.main' }} />
          )
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Box>
          <Typography variant="caption" color="textSecondary">
            {Math.round(progress)}% complete
          </Typography>
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
    <Link href={`/finger-spelling/sections/${section.id}`} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}

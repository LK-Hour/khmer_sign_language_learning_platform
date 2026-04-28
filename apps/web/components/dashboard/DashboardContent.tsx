'use client';

import { Container, Box, Paper, Typography, Button} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { StreakBadge, XPBadge, BadgeCountBadge } from '@/components/gamification/GamificationBadges';
import { ProgressRing } from '@/components/progress/ProgressRing';
import { UnitCard } from '@/components/cards/UnitCard';
import { SectionCard } from '@/components/cards/SectionCard';
import type { UnitListItem, SectionListItem, UserStatsDto } from '@ksl/shared';

export interface DashboardContentProps {
  stats: UserStatsDto | null;
  units: UnitListItem[];
  sections: SectionListItem[];
  activeTrack: 'sign-language' | 'finger-spelling';
  isLoading?: boolean;
}

/**
 * Reusable dashboard content component
 * Displays stats, track progress, and learning paths (Sign Language or Finger Spelling)
 */
export function DashboardContent({
  stats,
  units,
  sections,
  activeTrack,
  isLoading = false,
}: DashboardContentProps): JSX.Element {
  const t = useTranslations('dashboard');

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>{t('loadingDashboard')}</Typography>
      </Container>
    );
  }

  const items = activeTrack === 'sign-language' ? units : sections;
  const isSignLanguage = activeTrack === 'sign-language';

  // Calculate overall progress
  const totalProgress = Math.round(
    isSignLanguage
      ? units.reduce((acc, u) => acc + (u.progressPercent ?? 0), 0) / Math.max(units.length, 1)
      : sections.reduce((acc, s) => acc + (s.progressPercent ?? 0), 0) / Math.max(sections.length, 1)
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Top Stats Bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {stats && (
          <>
            <StreakBadge count={stats.streak} size="medium" />
            <XPBadge xp={stats.xp} size="medium" />
            <BadgeCountBadge count={stats.badges?.length || 0} size="medium" />
          </>
        )}
      </Box>

      {/* Overall Progress Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(192, 57, 43, 0.05) 0%, rgba(241, 196, 15, 0.05) 100%)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isSignLanguage ? t('signLanguage') : t('fingerSpelling')} {t('title')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ProgressRing
            value={totalProgress}
            size={120}
            label={isSignLanguage ? 'Units' : 'Sections'}
          />
        </Box>
      </Paper>

      {/* Learning Path Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {items.length > 0 ? (
          items.map((item, index) => (
            <Box key={item.id}>
              {isSignLanguage ? (
                <UnitCard
                  unit={item as UnitListItem}
                  isLocked={index > 0 && !(items[index - 1] as any).completed}
                />
              ) : (
                <SectionCard
                  section={item as SectionListItem}
                  isLocked={index > 0 && !(items[index - 1] as any).completed}
                />
              )}
            </Box>
          ))
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', gridColumn: '1 / -1' }}>
            <Typography color="textSecondary">
              {isSignLanguage ? t('noUnits') : t('noSections')}
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

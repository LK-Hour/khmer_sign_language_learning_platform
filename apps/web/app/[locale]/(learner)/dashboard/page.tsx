'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Alert, Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import type { SectionListItem, UnitListItem, UserStatsDto } from '@ksl/shared';

import { fetchSections, fetchUnits, fetchUserStats, hasAccessToken } from '@/lib/api/client';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

type DashboardState = {
  stats: UserStatsDto | null;
  units: UnitListItem[];
  sections: SectionListItem[];
};

type Track = 'sign-language' | 'finger-spelling';

const ACTIVE_TRACK_KEY = 'ksl_active_track';

function isTrack(value: string | null): value is Track {
  return value === 'sign-language' || value === 'finger-spelling';
}

export default function DashboardPage(): JSX.Element {
  const searchParams = useSearchParams();
  const t = useTranslations('dashboard');

  const [data, setData] = useState<DashboardState>({
    stats: null,
    units: [],
    sections: [],
  });
  const [activeTrack, setActiveTrack] = useState<Track>('sign-language');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle track selection from query params or local storage
  useEffect(() => {
    const queryTrack = searchParams.get('track');
    if (isTrack(queryTrack)) {
      setActiveTrack(queryTrack);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ACTIVE_TRACK_KEY, queryTrack);
      }
      return;
    }

    if (typeof window !== 'undefined') {
      const storedTrack = window.localStorage.getItem(ACTIVE_TRACK_KEY);
      if (isTrack(storedTrack)) {
        setActiveTrack(storedTrack);
        return;
      }
      window.localStorage.setItem(ACTIVE_TRACK_KEY, 'sign-language');
    }
  }, [searchParams]);

  // Fetch dashboard data
  useEffect(() => {
    async function load(): Promise<void> {
      if (!hasAccessToken()) {
        setErrorMessage(t('failedToLoad'));
        setIsLoading(false);
        return;
      }

      try {
        const [stats, units, sections] = await Promise.all([
          fetchUserStats(),
          fetchUnits(),
          fetchSections(),
        ]);
        setData({ stats, units, sections });
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(t('failedToLoad'));
        }
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [t]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>{t('loadingDashboard')}</Typography>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            {t('failedToLoad')}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <DashboardContent
      stats={data.stats}
      units={data.units}
      sections={data.sections}
      activeTrack={activeTrack}
      isLoading={isLoading}
    />
  );
}

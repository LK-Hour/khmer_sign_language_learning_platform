'use client';

import { Container, Box, Card, CardContent, Button, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { IconWithLabel } from '@/components/ui/TranslatedIcon';

export default function HomePage(): JSX.Element {
  const t = useTranslations('home');

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header Section */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 6,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #C0392B 0%, #F1C40F 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ mb: 4 }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Track Selection Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
          mb: 4,
        }}
      >
        {/* Sign Language Card */}
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-in-out',
            border: '2px solid transparent',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-8px)',
              borderColor: 'primary.main',
            },
          }}
        >
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 4,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <IconWithLabel
                  iconKey="sign-language"
                  text={t('signLanguage.title')}
                  size="large"
                  color="primary"
                  direction="column"
                />
              </Box>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                {t('signLanguage.description')}
              </Typography>
            </Box>
            <Link
              href="/dashboard?track=sign-language"
              style={{ textDecoration: 'none' }}
            >
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #A93226 0%, #C0392B 100%)',
                  },
                }}
              >
                {t('start')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Finger Spelling Card */}
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-in-out',
            border: '2px solid transparent',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-8px)',
              borderColor: 'primary.fingerSpelling',
            },
          }}
        >
          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 4,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <IconWithLabel
                  iconKey="finger-spelling"
                  text={t('fingerSpelling.title')}
                  size="large"
                  color="primary"
                  direction="column"
                />
              </Box>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                {t('fingerSpelling.description')}
              </Typography>
            </Box>
            <Link
              href="/dashboard?track=finger-spelling"
              style={{ textDecoration: 'none' }}
            >
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #2980B9 0%, #3498DB 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1E5A96 0%, #2980B9 100%)',
                  },
                }}
              >
                {t('start')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Box>

      {/* Info Section */}
      <Box
        sx={{
          mt: 8,
          pt: 4,
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body2"
          color="textSecondary"
        >
          Learn Khmer Sign Language at your own pace with interactive lessons and real-time feedback.
        </Typography>
      </Box>
    </Container>
  );
}

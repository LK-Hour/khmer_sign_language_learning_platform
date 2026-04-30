'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { fetchVideoQuizList, type VideoQuizListItemDto } from '@/lib/api/client';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  question_count: number;
}

export default function VideoWordQuizzesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await fetchVideoQuizList();
        setQuizzes(
          data.map((quiz: VideoQuizListItemDto) => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description ?? undefined,
            question_count: quiz.question_count,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.unknown'));
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [t]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        {t('quiz.videoWordQuizzes')}
      </Typography>

      {quizzes.length === 0 ? (
        <Alert severity="info">{t('quiz.noQuizzesAvailable')}</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {quizzes.map(quiz => (
            <Box key={quiz.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {quiz.title}
                  </Typography>
                  {quiz.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {quiz.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    {quiz.question_count} {t('quiz.questions')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ background: '#2980B9' }}
                    onClick={() => router.push(`./${quiz.id}`)}
                  >
                    {t('buttons.start')}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

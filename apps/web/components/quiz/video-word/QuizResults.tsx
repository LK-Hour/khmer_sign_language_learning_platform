'use client';

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface QuizResultsProps {
  attemptId: string;
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  badgesEarned: string[];
  onContinue: () => void;
}

export default function QuizResults({
  attemptId,
  scorePercent,
  passed,
  totalQuestions,
  correctAnswers,
  xpEarned,
  badgesEarned,
  onContinue,
}: QuizResultsProps) {
  const t = useTranslations();
  const router = useRouter();

  const passColor = passed ? 'success' : 'warning';
  const passIcon = passed ? <CheckCircleIcon /> : <CancelIcon />;

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        {passIcon}
        <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: passColor }}>
          {passed ? t('quiz.passed') : t('quiz.needsImprovement')}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          mb: 4,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h2" sx={{ fontWeight: 700, color: '#2980B9' }}>
                {scorePercent}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('quiz.scoreLabel')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent>
              <Typography variant="h2" sx={{ fontWeight: 700, color: '#27AE60' }}>
                +{xpEarned}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                XP {t('quiz.earned')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Card>
            <CardContent>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {correctAnswers}/{totalQuestions} {t('quiz.correct')}
              </Typography>
              <LinearProgress variant="determinate" value={scorePercent} />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {badgesEarned.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
            {t('quiz.badgesEarned')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {badgesEarned.map(badge => (
              <Chip key={badge} label={badge} color="primary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
        >
          {t('buttons.back')}
        </Button>
        <Button
          variant="contained"
          sx={{ background: '#2980B9' }}
          onClick={onContinue}
        >
          {t('buttons.continue')}
        </Button>
      </Box>
    </Box>
  );
}

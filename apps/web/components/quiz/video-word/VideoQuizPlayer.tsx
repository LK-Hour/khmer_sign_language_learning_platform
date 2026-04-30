'use client';

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface Question {
  id: string;
  order: number;
  video_url: string;
  video_duration_seconds?: number;
  prompt: string;
  options: string[];
}

interface VideoQuizPlayerProps {
  questions: Question[];
  quizTitle: string;
  onComplete: (responses: any[]) => void;
}

export default function VideoQuizPlayer({
  questions,
  quizTitle,
  onComplete,
}: VideoQuizPlayerProps) {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isAnswered = responses[currentQuestion.id] !== undefined;

  const handleSelectOption = (option: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All questions answered, submit
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      onComplete(
        questions.map(q => ({
          question_id: q.id,
          user_answer: responses[q.id] || '',
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        {quizTitle}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        }}
      >
        {/* Video Section */}
        <Box>
          <Card>
            <CardHeader
              title={`${t('quiz.question')} ${currentIndex + 1} / ${questions.length}`}
            />
            <CardContent>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  mb: 2,
                  backgroundColor: '#000',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <video
                  src={currentQuestion.video_url}
                  controls
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentQuestion.prompt}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Options Section */}
        <Box>
          <Card>
            <CardHeader title={t('quiz.yourAnswer')} />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={responses[currentQuestion.id] === option ? 'contained' : 'outlined'}
                    color={responses[currentQuestion.id] === option ? 'primary' : 'inherit'}
                    onClick={() => handleSelectOption(option)}
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontSize: '1rem',
                      py: 1.5,
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </Box>

              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={currentIndex === 0 || loading}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                >
                  {t('buttons.previous')}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!isAnswered || loading}
                  onClick={handleNext}
                  sx={{ background: '#2980B9' }}
                >
                  {loading ? <CircularProgress size={24} /> : currentIndex === questions.length - 1 ? t('buttons.submit') : t('buttons.next')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

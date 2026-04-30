'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useVideoWordQuiz } from '../../../../../../lib/hooks/useVideoWordQuiz';
import VideoQuizPlayer from '../../../../../../components/quiz/video-word/VideoQuizPlayer';
import QuizResults from '../../../../../../components/quiz/video-word/QuizResults';

import { submitVideoQuiz, type VideoQuizSubmitResponseDto } from '@/lib/api/client';

type PageState = 'loading' | 'playing' | 'results';

interface QuizResult {
  attempt_id: string;
  score_percent: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds?: number;
  xp_earned: number;
  badges_earned: string[];
}

function normalizeQuizResult(result: VideoQuizSubmitResponseDto): QuizResult {
  return {
    attempt_id: result.attempt_id,
    score_percent: result.score_percent,
    passed: result.passed,
    total_questions: result.total_questions,
    correct_answers: result.correct_answers,
    time_spent_seconds: result.time_spent_seconds ?? undefined,
    xp_earned: result.xp_earned,
    badges_earned: result.badges_earned,
  };
}

export default function QuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;

  const { quiz, loading, error } = useVideoWordQuiz(quizId);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && quiz) {
      setPageState('playing');
    }
  }, [loading, quiz]);

  const handleQuizComplete = async (responses: any[]) => {
    setSubmitting(true);
    try {
      const resultData: VideoQuizSubmitResponseDto = await submitVideoQuiz({
        quizId,
        responses,
      });
      setResult(normalizeQuizResult(resultData));
      setPageState('results');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!quiz) {
    return <Alert severity="warning">Quiz not found</Alert>;
  }

  if (pageState === 'playing' && quiz.questions) {
    const questions = quiz.questions.map((question) => ({
      id: question.id,
      order: question.order,
      video_url: question.video_url,
      video_duration_seconds: question.video_duration_seconds ?? undefined,
      prompt: question.prompt,
      options: question.options ?? [],
    }));

    return (
      <VideoQuizPlayer
        questions={questions}
        quizTitle={quiz.title}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (pageState === 'results' && result) {
    return (
      <QuizResults
        attemptId={result.attempt_id}
        scorePercent={result.score_percent}
        passed={result.passed}
        totalQuestions={result.total_questions}
        correctAnswers={result.correct_answers}
        xpEarned={result.xp_earned}
        badgesEarned={result.badges_earned}
        onContinue={() => window.location.href = '/dashboard'}
      />
    );
  }

  return null;
}

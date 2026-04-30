'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { fetchVideoQuizDetail, type VideoQuizDetailDto } from '@/lib/api/client';

interface UseVideoWordQuizState {
  quiz: VideoQuizDetailDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVideoWordQuiz(quizId?: string): UseVideoWordQuizState {
  const t = useTranslations();
  const [state, setState] = useState<UseVideoWordQuizState>({
    quiz: null,
    loading: true,
    error: null,
    refetch: async () => {},
  });

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const quiz = await fetchVideoQuizDetail(quizId);
      setState(prev => ({
        ...prev,
        quiz,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.unknown');
      setState(prev => ({
        ...prev,
        error: message,
        loading: false,
      }));
    }
  }, [quizId, t]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return {
    ...state,
    refetch: fetchQuiz,
  };
}

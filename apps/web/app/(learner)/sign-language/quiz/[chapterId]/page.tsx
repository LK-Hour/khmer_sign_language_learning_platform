"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { QUIZ_PASS_SCORE_SIGN, type QuizQuestion } from "@ksl/shared";

import { fetchChapterQuiz, submitChapterQuiz } from "@/lib/api/client";

type ChapterQuizPageProps = {
  params: {
    chapterId: string;
  };
};

export default function ChapterQuizPage({ params }: ChapterQuizPageProps): JSX.Element {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const payload = await fetchChapterQuiz(params.chapterId);
        setQuestions(payload);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load chapter quiz.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [params.chapterId]);

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.exerciseId] !== undefined).length,
    [answers, questions]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (questions.length === 0) {
      return;
    }
    const correct = questions.filter((question) => answers[question.exerciseId] === question.prompt).length;
    const score = Math.round((correct / questions.length) * 100);
    const stars = score >= 90 ? 5 : score >= 80 ? 4 : score >= 70 ? 3 : score >= 60 ? 2 : 1;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await submitChapterQuiz(params.chapterId, { score, stars });
      const url = `/sign-language/quiz/${params.chapterId}/results?score=${response.score}&passed=${
        response.passed ? "1" : "0"
      }&threshold=${QUIZ_PASS_SCORE_SIGN}`;
      router.push(url);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to submit chapter quiz.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading chapter quiz...</main>;
  }

  if (errorMessage && questions.length === 0) {
    return (
      <main style={{ padding: "2rem", color: "#C0392B" }}>
        Failed to load chapter quiz: {errorMessage}
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Chapter Quiz</h1>
      <p>Chapter ID: {params.chapterId}</p>
      <p>
        Answered {answeredCount}/{questions.length}
      </p>
      {questions.length === 0 ? (
        <p>No quiz questions available yet.</p>
      ) : (
        <form onSubmit={onSubmit}>
          <ol>
            {questions.map((question) => (
              <li key={question.exerciseId} style={{ marginBottom: "1rem" }}>
                <p>
                  <strong>{question.type}</strong> — {question.prompt}
                </p>
                {(question.options ?? [question.prompt]).map((option) => (
                  <label key={option} style={{ display: "block" }}>
                    <input
                      type="radio"
                      name={question.exerciseId}
                      value={option}
                      checked={answers[question.exerciseId] === option}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.exerciseId]: option,
                        }))
                      }
                    />{" "}
                    {option}
                  </label>
                ))}
              </li>
            ))}
          </ol>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit quiz"}
          </button>
        </form>
      )}
      {errorMessage ? <p style={{ color: "#C0392B" }}>Error: {errorMessage}</p> : null}
    </main>
  );
}

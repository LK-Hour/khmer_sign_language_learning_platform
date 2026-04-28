"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { QUIZ_PASS_SCORE_SPELLING, type QuizQuestion } from "@ksl/shared";

import { fetchSpellingQuiz, submitSpellingQuiz } from "@/lib/api/client";

type SectionQuizPageProps = {
  params: {
    sectionId: string;
  };
};

export default function SectionQuizPage({ params }: SectionQuizPageProps): JSX.Element {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const payload = await fetchSpellingQuiz(params.sectionId);
        setQuestions(payload);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load section quiz.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [params.sectionId]);

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
    const stars = score >= 90 ? 5 : score >= 80 ? 4 : score >= 75 ? 3 : score >= 60 ? 2 : 1;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await submitSpellingQuiz(params.sectionId, { score, stars });
      const url = `/finger-spelling/quiz/${params.sectionId}/results?score=${response.score}&passed=${
        response.passed ? "1" : "0"
      }&threshold=${QUIZ_PASS_SCORE_SPELLING}`;
      router.push(url);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to submit section quiz.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading section quiz...</main>;
  }

  if (errorMessage && questions.length === 0) {
    return (
      <main style={{ padding: "2rem", color: "#C0392B" }}>
        Failed to load section quiz: {errorMessage}
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Section Quiz</h1>
      <p>Section ID: {params.sectionId}</p>
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

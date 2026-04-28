"use client";

import { useEffect, useMemo, useState, use } from "react";

import type { LessonDetail, LessonExercise } from "@ksl/shared";

import { completeLesson, fetchLessonDetail } from "@/lib/api/client";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

type Stage = "intro" | "exercise" | "result";

function computeLessonStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

export default function LessonPage({ params }: LessonPageProps): JSX.Element {
  const { lessonId } = use(params);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const payload = await fetchLessonDetail(lessonId);
        setLesson(payload);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load lesson.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [lessonId]);

  const currentExercise = useMemo<LessonExercise | null>(() => {
    if (!lesson) return null;
    if (lesson.exercises.length === 0) return null;
    return lesson.exercises[index] ?? null;
  }, [index, lesson]);

  useEffect(() => {
    if (stage !== "exercise") return;
    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [stage]);

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading lesson...</main>;
  }

  if (errorMessage || lesson === null) {
    return (
      <main style={{ padding: "2rem", color: "#C0392B" }}>
        Failed to load lesson: {errorMessage ?? "Not found"}
      </main>
    );
  }

  if (lesson.exercises.length === 0) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>{lesson.title}</h1>
        <p>No exercises in this lesson yet.</p>
      </main>
    );
  }

  const total = lesson.exercises.length;
  const score = Math.round((correctCount / total) * 100);
  const stars = computeLessonStars(score);

  async function submitCompletion(): Promise<void> {
    setIsSaving(true);
    setSaveError(null);
    try {
      await completeLesson(lessonId, score, stars);
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Unable to save lesson completion.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function goToResult(): Promise<void> {
    setStage("result");
    await submitCompletion();
  }

  async function finishAnswer(answerCorrect: boolean): Promise<void> {
    setIsCorrect(answerCorrect);
    if (answerCorrect) {
      setCorrectCount((current) => current + 1);
    }
  }

  async function goNext(): Promise<void> {
    setSelectedOption(null);
    setIsCorrect(null);
    if (index >= total - 1) {
      await goToResult();
      return;
    }
    setIndex((current) => current + 1);
  }

  if (stage === "intro") {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>{lesson.title}</h1>
        <p>Estimated duration: {lesson.durationMinutes} minutes</p>
        <p>Exercises: {lesson.exercises.length}</p>
        <button type="button" onClick={() => setStage("exercise")}>
          Start lesson
        </button>
      </main>
    );
  }

  if (stage === "result") {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Lesson complete 🎉</h1>
        <p>Score: {score}%</p>
        <p>Stars: {"⭐".repeat(stars)}</p>
        {isSaving ? <p>Saving completion...</p> : null}
        {saveError ? <p style={{ color: "#C0392B" }}>Save failed: {saveError}</p> : null}
      </main>
    );
  }

  if (!currentExercise) {
    return <main style={{ padding: "2rem" }}>No exercise found.</main>;
  }

  const isWatchType = currentExercise.type === "VIDEO_WATCH";
  const options = currentExercise.options ?? [currentExercise.correctAnswer];

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{lesson.title}</h1>
      <p>
        Exercise {index + 1}/{total}
      </p>
      <h2>{currentExercise.type}</h2>
      <p>Video: {currentExercise.signVideoUrl}</p>
      <p>Slow motion (🐢): {currentExercise.slowMoVideoUrl}</p>

      {isWatchType ? (
        <button type="button" onClick={() => void finishAnswer(true)} disabled={isCorrect !== null}>
          I watched this sign
        </button>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem", maxWidth: 360 }}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (isCorrect !== null) return;
                setSelectedOption(option);
                void finishAnswer(option === currentExercise.correctAnswer);
              }}
              disabled={isCorrect !== null}
              style={{
                textAlign: "left",
                border:
                  isCorrect !== null && option === currentExercise.correctAnswer
                    ? "2px solid #2E7D32"
                    : selectedOption === option
                      ? "2px solid #C0392B"
                      : "1px solid #999",
                borderRadius: 8,
                padding: "0.5rem 0.75rem",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {isCorrect === true ? <p style={{ color: "#2E7D32" }}>Correct ✅</p> : null}
      {isCorrect === false ? (
        <p style={{ color: "#C0392B" }}>
          Not quite. Correct answer: <strong>{currentExercise.correctAnswer}</strong>
        </p>
      ) : null}

      <button type="button" onClick={() => void goNext()} disabled={isCorrect === null}>
        {index === total - 1 ? "Finish lesson" : "Next exercise"}
      </button>
    </main>
  );
}

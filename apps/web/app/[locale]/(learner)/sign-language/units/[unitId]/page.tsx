"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";

import type { UnitDetail } from "@ksl/shared";

import { fetchUnitDetail } from "@/lib/api/client";

type UnitPageProps = {
  params: Promise<{
    unitId: string;
  }>;
};

export default function UnitPage({ params }: UnitPageProps): JSX.Element {
  const { unitId } = use(params);
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const payload = await fetchUnitDetail(unitId);
        setUnit(payload);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load unit.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [unitId]);

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading unit...</main>;
  }

  if (errorMessage || unit === null) {
    return (
      <main style={{ padding: "2rem", color: "#C0392B" }}>
        Failed to load unit: {errorMessage ?? "Not found"}
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{unit.title}</h1>
      <p>{unit.description}</p>
      {unit.chapters.map((chapter) => (
        <section key={chapter.id} style={{ marginTop: "1rem" }}>
          <h2>{chapter.title}</h2>
          {chapter.lessons.length === 0 ? (
            <p>No lessons yet.</p>
          ) : (
            <ul>
              {chapter.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link href={`/sign-language/lessons/${lesson.id}`}>
                    {lesson.title} ({lesson.durationMinutes} min)
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/sign-language/quiz/${chapter.id}`}>Start chapter quiz</Link>
        </section>
      ))}
    </main>
  );
}

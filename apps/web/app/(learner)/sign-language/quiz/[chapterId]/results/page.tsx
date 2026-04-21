"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ChapterQuizResultsPageProps = {
  params: {
    chapterId: string;
  };
};

export default function ChapterQuizResultsPage({ params }: ChapterQuizResultsPageProps): JSX.Element {
  const search = useSearchParams();
  const score = Number(search.get("score") ?? 0);
  const passed = search.get("passed") === "1";
  const threshold = Number(search.get("threshold") ?? 70);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Chapter Quiz Results</h1>
      <p>Chapter ID: {params.chapterId}</p>
      <p>Score: {score}%</p>
      <p>{passed ? "Passed ✅" : `Not passed yet. Need at least ${threshold}%`}</p>
      <p>
        <Link href={`/sign-language/quiz/${params.chapterId}`}>Retry quiz</Link>
      </p>
    </main>
  );
}

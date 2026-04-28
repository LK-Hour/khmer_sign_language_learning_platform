"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type SectionQuizResultsPageProps = {
  params: {
    sectionId: string;
  };
};

export default function SectionQuizResultsPage({ params }: SectionQuizResultsPageProps): JSX.Element {
  const search = useSearchParams();
  const score = Number(search.get("score") ?? 0);
  const passed = search.get("passed") === "1";
  const threshold = Number(search.get("threshold") ?? 75);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Section Quiz Results</h1>
      <p>Section ID: {params.sectionId}</p>
      <p>Score: {score}%</p>
      <p>{passed ? "Passed ✅" : `Not passed yet. Need at least ${threshold}%`}</p>
      <p>
        <Link href={`/finger-spelling/quiz/${params.sectionId}`}>Retry quiz</Link>
      </p>
    </main>
  );
}

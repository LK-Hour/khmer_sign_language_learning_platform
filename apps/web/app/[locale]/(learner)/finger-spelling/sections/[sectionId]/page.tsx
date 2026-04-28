"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";

import type { SectionDetail } from "@ksl/shared";

import { fetchSectionDetail } from "@/lib/api/client";

type SectionPageProps = {
  params: Promise<{
    sectionId: string;
  }>;
};

export default function SectionPage({ params }: SectionPageProps): JSX.Element {
  const { sectionId } = use(params);
  const [section, setSection] = useState<SectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const payload = await fetchSectionDetail(sectionId);
        setSection(payload);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load section.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [sectionId]);

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading section...</main>;
  }

  if (errorMessage || section === null) {
    return (
      <main style={{ padding: "2rem", color: "#C0392B" }}>
        Failed to load section: {errorMessage ?? "Not found"}
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{section.title}</h1>
      <p>Letters covered: {section.lettersCovered.join(", ")}</p>
      {section.drillSets.length === 0 ? (
        <p>No drills yet.</p>
      ) : (
        <ul>
          {section.drillSets.map((drill) => (
            <li key={drill.id}>
              <Link href={`/finger-spelling/drills/${drill.id}`}>{drill.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link href={`/finger-spelling/quiz/${sectionId}`}>Start section quiz</Link>
    </main>
  );
}

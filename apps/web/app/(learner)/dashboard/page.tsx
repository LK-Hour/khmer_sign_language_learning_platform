"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { SectionListItem, UnitListItem, UserStatsDto } from "@ksl/shared";

import { fetchSections, fetchUnits, fetchUserStats, hasAccessToken } from "@/lib/api/client";

type DashboardState = {
  stats: UserStatsDto | null;
  units: UnitListItem[];
  sections: SectionListItem[];
};

type Track = "sign-language" | "finger-spelling";

const ACTIVE_TRACK_KEY = "ksl_active_track";

function isTrack(value: string | null): value is Track {
  return value === "sign-language" || value === "finger-spelling";
}

export default function DashboardPage(): JSX.Element {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DashboardState>({
    stats: null,
    units: [],
    sections: [],
  });
  const [activeTrack, setActiveTrack] = useState<Track>("sign-language");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const queryTrack = searchParams.get("track");
    if (isTrack(queryTrack)) {
      setActiveTrack(queryTrack);
      window.localStorage.setItem(ACTIVE_TRACK_KEY, queryTrack);
      return;
    }

    const storedTrack = window.localStorage.getItem(ACTIVE_TRACK_KEY);
    if (isTrack(storedTrack)) {
      setActiveTrack(storedTrack);
      return;
    }

    window.localStorage.setItem(ACTIVE_TRACK_KEY, "sign-language");
  }, [searchParams]);

  useEffect(() => {
    async function load(): Promise<void> {
      if (!hasAccessToken()) {
        setErrorMessage("Please login first.");
        setIsLoading(false);
        return;
      }

      try {
        const [stats, units, sections] = await Promise.all([
          fetchUserStats(),
          fetchUnits(),
          fetchSections(),
        ]);
        setData({ stats, units, sections });
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to load dashboard data.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  if (isLoading) {
    return <main style={{ padding: "2rem" }}>Loading dashboard...</main>;
  }

  if (errorMessage) {
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "#C0392B" }}>Failed to load dashboard: {errorMessage}</p>
        <p>
          <Link href="/login">Go to login</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Track Dashboard</h1>
      <p>
        {data.stats?.streak ?? 0} day streak · ⭐ {data.stats?.xp ?? 0} XP
      </p>

      {activeTrack === "sign-language" ? (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Sign Language</h2>
          {data.units.length === 0 ? (
            <p>No units yet.</p>
          ) : (
            <ul>
              {data.units.map((unit) => (
                <li key={unit.id}>
                  <Link href={`/sign-language/units/${unit.id}`}>{unit.title}</Link> - {unit.progressPercent}%
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Finger Spelling</h2>
          {data.sections.length === 0 ? (
            <p>No sections yet.</p>
          ) : (
            <ul>
              {data.sections.map((section) => (
                <li key={section.id}>
                  <Link href={`/finger-spelling/sections/${section.id}`}>{section.title}</Link> - {section.progressPercent}%
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

import Link from "next/link";

export default function HomePage(): JSX.Element {
  return (
    <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>KSL Learning Platform</h1>
      <p>Choose a learning track to continue.</p>

      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <article style={{ border: "1px solid #ddd", borderRadius: 12, padding: "1rem" }}>
          <h2>Sign Language</h2>
          <p>Learn full KSL signs, phrases, and sentence patterns.</p>
          <Link href="/dashboard?track=sign-language">Start Sign Language</Link>
        </article>

        <article style={{ border: "1px solid #ddd", borderRadius: 12, padding: "1rem" }}>
          <h2>Finger Spelling</h2>
          <p>Practice the KSL alphabet with drills and quizzes.</p>
          <Link href="/dashboard?track=finger-spelling">Start Finger Spelling</Link>
        </article>
      </section>

    </main>
  );
}

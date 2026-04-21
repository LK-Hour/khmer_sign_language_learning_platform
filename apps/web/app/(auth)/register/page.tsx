"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { register, saveTokens } from "@/lib/api/client";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const tokens = await register(email, password, displayName);
      saveTokens(tokens);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to create account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
      <h1>Register</h1>
      <form style={{ display: "grid", gap: "1rem" }} onSubmit={onSubmit}>
        <label>
          Display name
          <input
            type="text"
            name="displayName"
            style={{ display: "block", width: "100%" }}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            style={{ display: "block", width: "100%" }}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            style={{ display: "block", width: "100%" }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      {errorMessage ? (
        <p style={{ marginTop: "1rem", color: "#C0392B" }}>Failed to register: {errorMessage}</p>
      ) : null}
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}

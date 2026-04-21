"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { login, loginWithGoogle, saveTokens } from "@/lib/api/client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      locale?: string;
    }
  ) => void;
};

type GoogleGlobal = {
  accounts: {
    id: GoogleAccountsId;
  };
};

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const googleContainerRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    let cancelled = false;

    const onCredential = async (response: GoogleCredentialResponse): Promise<void> => {
      if (!response.credential) {
        setErrorMessage("Google login did not return a credential.");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);
      try {
        const tokens = await loginWithGoogle(response.credential);
        saveTokens(tokens);
        router.push("/dashboard");
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Unable to login with Google.");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const renderGoogleButton = (): void => {
      if (cancelled || !window.google || !googleContainerRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          void onCredential(response);
        },
      });

      googleContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 280,
        locale: "en",
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-google-identity='true']");
    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton);
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", renderGoogleButton);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", renderGoogleButton);
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderGoogleButton);
    };
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const tokens = await login(email, password);
      saveTokens(tokens);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to login.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
      <h1>Login</h1>
      <div style={{ marginBottom: "1rem" }} ref={googleContainerRef} />
      {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Google Sign-In is disabled. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.
        </p>
      ) : null}
      <form style={{ display: "grid", gap: "1rem" }} onSubmit={onSubmit}>
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {errorMessage ? (
        <p style={{ marginTop: "1rem", color: "#C0392B" }}>Failed to login: {errorMessage}</p>
      ) : null}
      <p style={{ marginTop: "1rem" }}>
        New here? <Link href="/register">Create an account</Link>
      </p>
    </main>
  );
}

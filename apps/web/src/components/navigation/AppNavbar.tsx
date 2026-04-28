"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearTokens, hasAccessToken } from "@/lib/api/client";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dictionary", label: "Dictionary" },
];

export default function AppNavbar(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(hasAccessToken());
  }, [pathname]);

  function handleLogout(): void {
    clearTokens();
    setIsAuthenticated(false);
    router.push("/login");
  }

  return (
    <header style={{ borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
      <nav
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0.8rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
        aria-label="Main navigation"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/" style={{ fontWeight: 700, textDecoration: "none", color: "#111827" }}>
            KSL Learning
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: "none",
                    color: isActive ? "#0f172a" : "#475569",
                    fontWeight: isActive ? 600 : 500,
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                border: "1px solid #d1d5db",
                background: "#fff",
                borderRadius: 8,
                padding: "0.4rem 0.75rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  border: "1px solid #d1d5db",
                  textDecoration: "none",
                  color: "#111827",
                  borderRadius: 8,
                  padding: "0.4rem 0.75rem",
                }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                style={{
                  border: "1px solid #0f172a",
                  background: "#0f172a",
                  textDecoration: "none",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "0.4rem 0.75rem",
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

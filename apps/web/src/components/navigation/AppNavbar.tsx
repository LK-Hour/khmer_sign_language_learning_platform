"use client";

import { useTranslations } from "next-intl";
// IMPORT FROM YOUR ROUTING FILE
import { Link, usePathname, useRouter } from "@/i18n/routing"; 
import { useEffect, useState } from "react";
import { clearTokens, hasAccessToken } from "@/lib/api/client";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppNavbar(): JSX.Element {
  const t = useTranslations("navbar"); // Assuming you add a "Navbar" section to your JSON
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define links inside the component to use translations
  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/dashboard", label: t("dashboard") },
    { href: "/dictionary", label: t("dictionary") },
  ];

  useEffect(() => {
    setIsAuthenticated(hasAccessToken());
  }, [pathname]);

  function handleLogout(): void {
    clearTokens();
    setIsAuthenticated(false);
    router.push("/login"); // next-intl router adds the locale automatically
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
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* NOW YOU CAN UNCOMMENT THIS */}
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
              {t("logout")}
            </button>
          ) : (
            <>
              <Link href="/login" style={linkButtonStyle}>
                {t("signIn")}
              </Link>
              <Link href="/register" style={primaryButtonStyle}>
                {t("signUp")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

// Simple style objects for readability
const linkButtonStyle = {
  border: "1px solid #d1d5db",
  textDecoration: "none",
  color: "#111827",
  borderRadius: 8,
  padding: "0.4rem 0.75rem",
};

const primaryButtonStyle = {
  border: "1px solid #0f172a",
  background: "#0f172a",
  textDecoration: "none",
  color: "#fff",
  borderRadius: 8,
  padding: "0.4rem 0.75rem",
};
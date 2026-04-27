import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import AppNavbar from "@/components/navigation/AppNavbar";
import { ThemeProviders } from "@/app/providers";

export const metadata: Metadata = {
  title: "KSL Learning Platform",
  description: "Khmer Sign Language learning platform",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="km">
      <body>
        <ThemeProviders>
          <AppNavbar />
          {children}
        </ThemeProviders>
      </body>
    </html>
  );
}

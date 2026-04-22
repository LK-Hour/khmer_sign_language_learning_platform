import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import AppNavbar from "@/components/navigation/AppNavbar";

export const metadata: Metadata = {
  title: "KSL Learning Platform",
  description: "Khmer Sign Language learning platform",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body>
        <AppNavbar />
        {children}
      </body>
    </html>
  );
}

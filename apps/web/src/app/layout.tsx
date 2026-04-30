import type { ReactNode } from 'react';
import './globals.css';

type RootLayoutProps = {
  children: ReactNode;
};

// This layout is required but should be minimal. 
// The [locale] layout will handle the <html> and <body> tags.
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
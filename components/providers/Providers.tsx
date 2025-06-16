'use client';

import { ThemeProvider } from './ThemeProvider';
import { PostHogProvider } from './PostHogProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </ThemeProvider>
  );
} 
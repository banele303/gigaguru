import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShoeBlessed",
  description: "Your one-stop shop for all your shoe needs",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <PostHogProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

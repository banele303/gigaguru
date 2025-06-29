import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
// import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { CartProvider } from './context/CartContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Giga Guru the Poetry In Me",
  description: "Your one-stop shop for all your shoe needs",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
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
      <body className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {/* <PostHogProvider>
            <CartProvider>
              {children}
              <Toaster position="top-center" richColors closeButton />
            </CartProvider>
          </PostHogProvider> */}
          <CartProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

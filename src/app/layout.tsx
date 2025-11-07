import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flash Card App",
  description: "Ứng dụng thẻ học tập đơn giản và hiệu quả",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
        <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur flex justify-center items-center p-5">
          <span>© 2025 Flash Card App. All rights reserved.</span>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Mono } from "next/font/google"
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { StockTicker } from "@/components/global/Ticker";
import Header from "@/components/global/Header";

// Use Space Mono as our monospace font
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "McIndex",
  description: "McIndex: A global tracker of McDonald's prices to visualize cost-of-living & inflation worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={spaceMono.className}
      >
        <ThemeProvider attribute="class">
          <StockTicker />
          <div className="max-w-6xl mx-auto p-6">
            <Header />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

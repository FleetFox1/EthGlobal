import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivyProvider } from "@/components/PrivyProvider";
import { UserProvider } from "@/lib/UserContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { LandingModalWrapper } from "@/components/LandingModalWrapper";
import "./globals.css";
import "./nft-effects.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BugDex - Web3 Bug Collection",
  description: "Discover, collect, and trade bug NFTs on the blockchain. Built for ETHGlobal 2025.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="bugdex-theme"
          enableColorScheme={true}
        >
          <PrivyProvider>
            <UserProvider>
              <Header />
              <LandingModalWrapper />
              {children}
            </UserProvider>
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

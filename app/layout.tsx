import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import "@mysten/dapp-kit/dist/index.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walmarket - Decentralized Prediction Markets on SUI",
  description: "A truth engine powered by Walrus - predict, verify, and earn on decentralized prediction markets",
  metadataBase: new URL('https://walmarket.fun'),
  openGraph: {
    title: "Walmarket - Decentralized Truth Through Markets",
    description: "AI-powered prediction markets on SUI. Where collective intelligence meets blockchain transparency to create verifiable truth.",
    url: 'https://walmarket.fun',
    siteName: 'Walmarket',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 576,
        alt: 'Walmarket - AI-Powered Prediction Markets',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Walmarket - Decentralized Truth Through Markets",
    description: "AI-powered prediction markets on SUI. Predict, verify, and earn.",
    images: ['/og-image.png'],
  },
  keywords: [
    'prediction markets',
    'SUI blockchain',
    'Walrus storage',
    'AI oracle',
    'decentralized',
    'Web3',
    'DeFi',
    'blockchain',
    'cryptocurrency',
    'truth engine',
  ],
  authors: [{ name: 'Walmarket Team' }],
  creator: 'Walmarket',
  publisher: 'Walmarket',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

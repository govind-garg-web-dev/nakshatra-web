import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Nakshatra — Vedic Astrology for Modern Life",
    template: "%s | Nakshatra",
  },
  description:
    "Free Vedic birth chart (Kundli), compatibility matching, AI astrologer chat, and auspicious timing — built for Gen Z and millennials.",
  openGraph: {
    title: "Nakshatra — Vedic Astrology for Modern Life",
    description:
      "Free Kundli, compatibility, AI astrologer chat, and Shubh Muhurat — ancient wisdom for modern decisions.",
    url: baseUrl,
    siteName: "Nakshatra",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nakshatra — Vedic Astrology for Modern Life",
    description: "Free Kundli, compatibility, AI astrologer chat, and Shubh Muhurat.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

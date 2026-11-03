import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RACE DAY SPEED & GLORY — Vista sua paixão",
    template: "%s | RACE DAY SPEED & GLORY",
  },
  description:
    "Camisetas, jaquetas, equipamentos e colecionáveis do universo motorsport. Da pista para as ruas, o verdadeiro estilo Race Day.",
  keywords: [
    "Race Day",
    "camisetas motorsport",
    "MotoGP",
    "jaqueta Alpinestars",
    "colecionáveis",
    "racedayspeed",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "RACE DAY SPEED & GLORY",
    title: "RACE DAY SPEED & GLORY — Vista sua paixão",
    description:
      "Da pista para as ruas. Camisetas, jaquetas, equipamentos e colecionáveis do universo motorsport.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Race Day Speed & Glory" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080a0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}

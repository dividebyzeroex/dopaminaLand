import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";
import { DailyProvider } from "@/contexts/DailyContext";
import Footer from "@/components/Footer";
import AchievementToast from "@/components/AchievementToast";
import FomoToast from "@/components/FomoToast";
import TrackingProvider from "@/components/TrackingProvider";
import { CSPostHogProvider } from "@/providers/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  themeColor: "#080914",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dopaminado.com.br'),
  title: "Dopamina — Compare preços e baixe seu relatório gratuito",
  description:
    "Compare resultados de produtos, veja os preços encontrados e baixe gratuitamente um relatório com links e horário da consulta.",
  keywords: [
    "dopamina",
    "auditoria de preços",
    "comparador de preços",
    "preço justo",
    "alerta de preço",
    "sobrepreço",
    "histórico de preços",
    "dopaminado",
    "verificar preço",
    "comprar barato",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Dopamina — Compare preços e baixe seu relatório gratuito",
    description:
      "Compare resultados encontrados agora e baixe gratuitamente seu relatório de preços.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GameProvider>
            <DailyProvider>
              <TrackingProvider>
                <CSPostHogProvider>
                  <main className="flex-1 overflow-x-clip">{children}</main>
                </CSPostHogProvider>
              </TrackingProvider>
            </DailyProvider>
        </GameProvider>
        <Analytics />
        <SpeedInsights />
        
        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JG8ZCXR32T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JG8ZCXR32T');
          `}
        </Script>

        {/* HubSpot Embed Code */}
        <Script 
          id="hs-script-loader" 
          src="//js-na1.hs-scripts.com/51726820.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}

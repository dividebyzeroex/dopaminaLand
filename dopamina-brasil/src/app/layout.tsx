import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { GameProvider } from "@/contexts/GameContext";
import { DailyProvider } from "@/contexts/DailyContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AchievementToast from "@/components/AchievementToast";
import FomoToast from "@/components/FomoToast";
import TrackingProvider from "@/components/TrackingProvider";
import CustomCursor from "@/components/CustomCursor";
import ScanLine from "@/components/ScanLine";
import CinematicIntro from "@/components/CinematicIntro";
import NicknameSetup from "@/components/NicknameSetup";
import DailyModal from "@/components/DailyModal";
import DetoxMode from "@/components/DetoxMode";
import { CSPostHogProvider } from "@/providers/PostHogProvider";
import ManipulationNarrator from "@/components/ManipulationNarrator";
import LivePresence from "@/components/LivePresence";
import NeuroXRay from "@/components/NeuroXRay";
import ResistanceTraining from "@/components/ResistanceTraining";

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
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dopaminado.com.br'),
  title: "Dopamina Brasil ⚡ — Estimule sua Dopamina de Compras Grátis",
  description:
    "Extravase e estimule sua dopamina de compras sem gastar um único centavo. O simulador de e-commerce cyberpunk onde a dopamina é infinita e o preço é R$ 0,00.",
  keywords: [
    "dopamina",
    "o que é dopamina",
    "dopamina de comprar",
    "estimular dopamina",
    "loja cyberpunk",
    "e-commerce paródia",
    "comprar sem gastar",
    "checkout falso",
    "rastreamento falso",
    "simulador de compras",
    "dopaminado",
    "compras virtuais",
    "frete grátis infinito",
    "gamificação"
  ],
  robots: "index, follow",
  openGraph: {
    title: "Dopamina Brasil ⚡ — Estimule sua Dopamina de Compras Grátis",
    description:
      "O simulador de e-commerce cyberpunk projetado para você obter o prazer da dopamina de compras sem fatura.",
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
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GameProvider>
          <CartProvider>
            <DailyProvider>
              <TrackingProvider>
                <CSPostHogProvider>
                  <CinematicIntro />
                  <NicknameSetup />
                  <DailyModal />
                  <CustomCursor />
                  <ScanLine />
                  <Header />
                  <main className="flex-1 overflow-x-clip pt-28 pb-8">{children}</main>
                  <Footer />
                  <CartDrawer />
                  <AchievementToast />
                  <FomoToast />
                  <DetoxMode />
                  <ManipulationNarrator />
                  <LivePresence />
                  <NeuroXRay />
                  <ResistanceTraining />
                </CSPostHogProvider>
              </TrackingProvider>
            </DailyProvider>
          </CartProvider>
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

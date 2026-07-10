import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { GameProvider } from "@/contexts/GameContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AchievementToast from "@/components/AchievementToast";
import TrackingProvider from "@/components/TrackingProvider";

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
  themeColor: "#ccff00",
};

export const metadata: Metadata = {
  title: "dopaminado ⚡ — Compre o que quiser. Gaste zero.",
  description:
    "O e-commerce cyberpunk onde você compra a dopamina sem usar o limite. Checkout blindado, produtos ultra-desejáveis e fatura em R$ 0,00.",
  keywords: [
    "loja cyberpunk",
    "e-commerce paródia",
    "dopamina de comprar",
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
    title: "dopaminado ⚡ — Compre o que quiser. Gaste zero.",
    description:
      "O e-commerce cyberpunk que vende a emoção de comprar sem o peso da fatura.",
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
      <body className="min-h-full flex flex-col">
        <GameProvider>
          <CartProvider>
            <TrackingProvider>
              <Header />
              <main className="flex-1 overflow-x-clip pt-28 pb-8">{children}</main>
              <Footer />
              <CartDrawer />
              <AchievementToast />
            </TrackingProvider>
          </CartProvider>
        </GameProvider>
        <Analytics />
      </body>
    </html>
  );
}

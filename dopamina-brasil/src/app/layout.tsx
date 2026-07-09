import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  title: "dopamina 💊 — a loja onde você compra sem gastar",
  description:
    "O e-commerce que vende a dopamina de comprar. Checkout 1-clique que se paga sozinho, rastreamento ao vivo pelo Brasil e a fatura nunca chega. 100% produtos falsos, 100% dopamina real.",
  keywords: [
    "loja falsa",
    "e-commerce paródia",
    "dopamina de comprar",
    "comprar sem gastar",
    "checkout falso",
    "rastreamento falso",
    "simulador de compras",
    "dopamina brasil",
  ],
  robots: "index, follow",
  openGraph: {
    title: "dopamina 💊 — a loja onde você compra sem gastar",
    description:
      "O e-commerce que vende a dopamina de comprar. 100% falso, 200% dopamina.",
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
              <main className="flex-1 overflow-x-clip">{children}</main>
              <Footer />
              <CartDrawer />
              <AchievementToast />
            </TrackingProvider>
          </CartProvider>
        </GameProvider>
      </body>
    </html>
  );
}

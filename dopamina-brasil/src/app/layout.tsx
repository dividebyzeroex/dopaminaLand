import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import TrackingProvider from "@/components/TrackingProvider";
import { CSPostHogProvider } from "@/providers/PostHogProvider";
import PwaInit from "@/components/pwa/PwaInit";
import InstallBanner from "@/components/pwa/InstallBanner";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Ocupa a tela inteira, inclusive atrás da barra de status e do recorte da câmera.
  viewportFit: "cover",
  // No app instalado, a área da barra de status assume a cor do cabeçalho escuro
  // (o iOS usa a theme-color ali); no navegador, a cor do papel.
  themeColor: [
    { media: "(display-mode: standalone)", color: "#20211f" },
    { media: "(prefers-color-scheme: dark)", color: "#20211f" },
    { color: "#f5f5f0" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dopaminado.com.br'),
  title: {
    default: "Dopamina — histórico de preços: desconto de verdade ou maquiagem?",
    template: "%s · Dopamina",
  },
  description:
    "Veja o histórico de preços de qualquer produto e descubra se o desconto é real na Black Friday, no Natal, no Dia das Mães e em outras datas. Compare lojas antes de comprar.",
  keywords: [
    "dopamina",
    "black friday",
    "histórico de preço",
    "desconto falso",
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
  applicationName: "Dopamina",
  // iPhone: app de tela cheia com a barra de status sobre o cabeçalho escuro.
  appleWebApp: { capable: true, title: "Dopamina", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Dopamina — desconto de verdade ou maquiagem?",
    description:
      "Histórico de preços e veredito honesto: descubra se o desconto é real antes de comprar.",
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
        <TrackingProvider>
          <CSPostHogProvider>
            <main className="flex-1 overflow-x-clip">{children}</main>
            <PwaInit />
            <InstallBanner />
          </CSPostHogProvider>
        </TrackingProvider>
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

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

// Rotas da antiga "loja fictícia" (gamificação, H53, rastreamento simulado).
// Redirecionam para a home para não perder links já indexados.
const legacyRoutes = [
  "/lootbox",
  "/h53",
  "/ranking",
  "/rastreamento/:path*",
  "/admin/:path*",
  "/carrinho",
  "/checkout",
  "/ofertas",
  "/minha-conta",
];

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    // Somente os CDNs de imagem da fonte de preços. Um curinga "**" transformaria
    // o otimizador de imagens em proxy aberto para qualquer site.
    remotePatterns: [
      { protocol: "https", hostname: "image.zst.com.br" },
      { protocol: "https", hostname: "i.zst.com.br" },
      { protocol: "https", hostname: "s.zst.com.br" },
    ],
  },
  async redirects() {
    return [
      ...legacyRoutes.map(source => ({ source, destination: "/", permanent: true })),
      // A campanha de Black Friday virou uma das datas do calendário.
      { source: "/black-friday", destination: "/datas/black-friday", permanent: true },
    ];
  },
};

export default withPWA(nextConfig);

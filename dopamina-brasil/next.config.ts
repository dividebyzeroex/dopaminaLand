import type { NextConfig } from "next";

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
  // O cartão de Raio-X lê a fonte da marca do disco; sem isto ela pode ficar fora do pacote da função.
  outputFileTracingIncludes: { "/og/cartao/[...slug]": ["./src/lib/og-fonts/**/*"] },
  images: {
    // Somente os CDNs de imagem da fonte de preços. Um curinga "**" transformaria
    // o otimizador de imagens em proxy aberto para qualquer site.
    remotePatterns: [
      { protocol: "https", hostname: "image.zst.com.br" },
      { protocol: "https", hostname: "i.zst.com.br" },
      { protocol: "https", hostname: "s.zst.com.br" },
    ],
  },
  async headers() {
    // O service worker nunca pode ficar preso em cache, senão correções demoram a chegar.
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] }];
  },
  async redirects() {
    return [
      ...legacyRoutes.map(source => ({ source, destination: "/", permanent: true })),
      // A campanha de Black Friday virou uma das datas do calendário.
      { source: "/black-friday", destination: "/datas/black-friday", permanent: true },
    ];
  },
};

// O service worker é o arquivo estático public/sw.js (o plugin de PWA antigo
// não roda com o Turbopack e nunca chegou a gerar um).
export default nextConfig;

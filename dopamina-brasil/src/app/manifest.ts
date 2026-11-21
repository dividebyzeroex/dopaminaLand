import type { MetadataRoute } from "next";

/** Manifesto do app instalável (tela inicial). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Dopamina — preço de verdade",
    short_name: "Dopamina",
    description: "Histórico de preços, veredito honesto e alertas quando o preço baixa, sobe ou estabiliza.",
    lang: "pt-BR",
    start_url: "/?origem=app",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f5f5f0",
    // Mesma cor do cabeçalho do app: a barra de status do Android se funde a ele.
    theme_color: "#20211f",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Android: o Dopamina aparece no menu "Compartilhar" dos apps de loja.
    share_target: { action: "/compartilhar", method: "GET", params: { title: "title", text: "text", url: "url" } },
    shortcuts: [
      { name: "Minha lista", url: "/lista?origem=atalho", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Datas comerciais", url: "/datas?origem=atalho", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}

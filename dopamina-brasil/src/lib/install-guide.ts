import type { DeviceBrowser, DeviceOs } from "./pwa-client";

/**
 * Passo a passo para colocar o Dopamina na tela inicial, por sistema e navegador.
 * Cada passo pode citar um ícone (desenhado no componente) para a pessoa achar o botão.
 */
export type GuideIcon = "share" | "dots-h" | "dots-v" | "menu" | "plus" | "install" | "toggle";
export type GuideStep = { text: string; icon?: GuideIcon };
export type InstallGuide = { label: string; steps: GuideStep[]; note?: string };

export function installGuide(os: DeviceOs, browser: DeviceBrowser, safariNew: boolean): InstallGuide {
  if (browser === "inapp") {
    return {
      label: os === "ios" ? "Navegador do app (Instagram, WhatsApp…)" : "Navegador do app (Instagram, WhatsApp…)",
      steps: [
        { text: "Toque no menu ⋯ deste app, no canto da tela.", icon: "dots-h" },
        { text: os === "ios" ? "Escolha “Abrir no Safari” (ou “Abrir no navegador”)." : "Escolha “Abrir no Chrome” (ou “Abrir no navegador”)." },
        { text: "Lá, volte a esta página para ver o passo a passo." },
      ],
      note: "Navegadores dentro de outros apps não conseguem instalar o Dopamina.",
    };
  }

  if (os === "ios") {
    if (browser === "safari" && safariNew) {
      return {
        label: "iPhone/iPad · Safari (iOS 26)",
        steps: [
          { text: "Toque em ⋯ no canto inferior direito.", icon: "dots-h" },
          { text: "Toque em Compartilhar.", icon: "share" },
          { text: "Role e escolha Adicionar à Tela de Início.", icon: "plus" },
          { text: "Deixe “Abrir como App Web” ligado e toque em Adicionar.", icon: "toggle" },
        ],
      };
    }
    if (browser === "safari") {
      return {
        label: "iPhone/iPad · Safari",
        steps: [
          { text: "Toque em Compartilhar na barra do Safari.", icon: "share" },
          { text: "Role e escolha Adicionar à Tela de Início.", icon: "plus" },
          { text: "Toque em Adicionar, no canto superior direito." },
        ],
      };
    }
    return {
      label: `iPhone/iPad · ${browser === "chrome" ? "Chrome" : browser === "edge" ? "Edge" : browser === "firefox" ? "Firefox" : "outro navegador"}`,
      steps: [
        { text: "Toque em Compartilhar, ao lado da barra de endereço (ou no menu ⋯).", icon: "share" },
        { text: "Escolha Adicionar à Tela de Início.", icon: "plus" },
        { text: "Toque em Adicionar." },
      ],
      note: "Se a opção não aparecer, abra esta página no Safari e siga o passo a passo de lá.",
    };
  }

  if (os === "android") {
    if (browser === "samsung") {
      return {
        label: "Android · Samsung Internet",
        steps: [
          { text: "Toque no menu ≡ no canto inferior direito.", icon: "menu" },
          { text: "Escolha Adicionar página a › Tela inicial.", icon: "plus" },
          { text: "Confirme em Adicionar." },
        ],
      };
    }
    if (browser === "firefox") {
      return {
        label: "Android · Firefox",
        steps: [
          { text: "Toque no menu ⋮.", icon: "dots-v" },
          { text: "Escolha Instalar (ou Adicionar à tela inicial).", icon: "install" },
          { text: "Confirme em Adicionar." },
        ],
      };
    }
    if (browser === "edge") {
      return {
        label: "Android · Edge",
        steps: [
          { text: "Toque no menu ⋯ na barra inferior.", icon: "dots-h" },
          { text: "Escolha Adicionar ao telefone.", icon: "install" },
          { text: "Confirme em Instalar." },
        ],
      };
    }
    return {
      label: "Android · Chrome",
      steps: [
        { text: "Toque no menu ⋮ no canto superior direito.", icon: "dots-v" },
        { text: "Escolha Instalar app (ou Adicionar à tela inicial).", icon: "install" },
        { text: "Confirme em Instalar." },
      ],
    };
  }

  return {
    label: `Computador · ${browser === "edge" ? "Edge" : browser === "chrome" ? "Chrome" : "navegador"}`,
    steps: browser === "chrome" || browser === "edge"
      ? [{ text: "Clique no ícone de instalar na barra de endereço (ou no menu ⋮ › Instalar Dopamina).", icon: "install" }, { text: "Confirme em Instalar." }]
      : [{ text: "Use o Chrome ou o Edge para instalar o Dopamina no computador.", icon: "install" }],
    note: browser === "safari" ? "No Mac, o Safari também instala: menu Arquivo › Adicionar ao Dock." : undefined,
  };
}

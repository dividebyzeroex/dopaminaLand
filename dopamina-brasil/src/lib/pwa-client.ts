"use client";

/**
 * Estado do app no aparelho: instalação (tela inicial) e notificações push.
 * Guardado em módulo para que qualquer componente leia o mesmo estado.
 */

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferredInstall: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());

export function subscribePwa(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function initPwa() {
  if (typeof window === "undefined" || (window as unknown as { __dopaPwa?: boolean }).__dopaPwa) return;
  (window as unknown as { __dopaPwa?: boolean }).__dopaPwa = true;
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstall = event as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => { deferredInstall = null; emit(); });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }
}

export type PwaState = {
  standalone: boolean;
  ios: boolean;
  mobile: boolean;
  canPromptInstall: boolean;
  pushSupported: boolean;
  permission: NotificationPermission | "unsupported";
};

const SERVER_STATE: PwaState = { standalone: false, ios: false, mobile: false, canPromptInstall: false, pushSupported: false, permission: "unsupported" };
let cached: PwaState = SERVER_STATE;

export function getPwaState(): PwaState {
  if (typeof window === "undefined") return SERVER_STATE;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  const pushSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const next: PwaState = {
    standalone, ios, mobile: /Android|iPhone|iPad|iPod|Mobile/.test(ua) || ios,
    canPromptInstall: Boolean(deferredInstall), pushSupported,
    permission: "Notification" in window ? Notification.permission : "unsupported",
  };
  // Mesmo objeto enquanto nada muda (exigência do useSyncExternalStore).
  if (JSON.stringify(next) !== JSON.stringify(cached)) cached = next;
  return cached;
}
export const getServerPwaState = () => SERVER_STATE;

export async function promptInstall(): Promise<boolean> {
  if (!deferredInstall) return false;
  await deferredInstall.prompt();
  const choice = await deferredInstall.userChoice.catch(() => ({ outcome: "dismissed" as const }));
  deferredInstall = null;
  emit();
  return choice.outcome === "accepted";
}

function base64ToBytes(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

/** Pede permissão e devolve a inscrição de push do aparelho (ou o motivo de não ter). */
export async function ensurePushSubscription(): Promise<{ subscription: PushSubscription } | { error: "unsupported" | "denied" | "no-key" | "failed" }> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return { error: "no-key" };
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return { error: "unsupported" };
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  emit();
  if (permission !== "granted") return { error: "denied" };
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
    await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(key) });
    return { subscription };
  } catch {
    return { error: "failed" };
  }
}

export async function currentEndpoint(): Promise<string | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const sub = await registration?.pushManager.getSubscription();
  return sub?.endpoint ?? null;
}

const WATCHED_KEY = "dopamina:alertas";
export function watchedPaths(): string[] {
  try { return JSON.parse(localStorage.getItem(WATCHED_KEY) || "[]"); } catch { return []; }
}
export function rememberWatched(path: string, on: boolean) {
  try {
    const set = new Set(watchedPaths());
    if (on) set.add(path); else set.delete(path);
    localStorage.setItem(WATCHED_KEY, JSON.stringify([...set]));
  } catch { /* armazenamento indisponível: só perde o selo "alerta ativo" */ }
  emit();
}

/** Lê um valor do localStorage com segurança (modo privado, bloqueios). */
export function readLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function writeLocal(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* ok */ }
  emit();
}

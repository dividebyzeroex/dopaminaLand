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
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(() => startCheckOnOpen())
      .catch(() => undefined);
  }
}

export type DeviceOs = "ios" | "android" | "desktop";
export type DeviceBrowser = "safari" | "chrome" | "samsung" | "firefox" | "edge" | "opera" | "inapp" | "other";

export type PwaState = {
  standalone: boolean;
  ios: boolean;
  mobile: boolean;
  os: DeviceOs;
  browser: DeviceBrowser;
  /** Safari 26+ (iOS 26): o botão Compartilhar fica dentro do menu ⋯. */
  safariNew: boolean;
  canPromptInstall: boolean;
  pushSupported: boolean;
  permission: NotificationPermission | "unsupported";
};

const SERVER_STATE: PwaState = { standalone: false, ios: false, mobile: false, os: "desktop", browser: "other", safariNew: false, canPromptInstall: false, pushSupported: false, permission: "unsupported" };

/** Sistema e navegador a partir do user agent (só para escolher as instruções certas). */
export function detectDevice(ua: string, maxTouchPoints = 0, platform = ""): { os: DeviceOs; browser: DeviceBrowser; safariNew: boolean } {
  const ios = /iPhone|iPad|iPod/.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const os: DeviceOs = ios ? "ios" : android ? "android" : "desktop";
  let browser: DeviceBrowser = "other";
  if (/Instagram|FBAN|FBAV|FB_IAB|WhatsApp|TikTok|musical_ly|Line\/|LinkedInApp|Snapchat|; wv\)/i.test(ua)) browser = "inapp";
  else if (/SamsungBrowser/i.test(ua)) browser = "samsung";
  else if (/EdgiOS|EdgA|Edg\//.test(ua)) browser = "edge";
  else if (/FxiOS|Firefox/.test(ua)) browser = "firefox";
  else if (/OPR\/|OPiOS|OPT\//.test(ua)) browser = "opera";
  else if (/CriOS|Chrome\//.test(ua)) browser = "chrome";
  else if (/Safari/.test(ua)) browser = "safari";
  const version = Number(ua.match(/Version\/(\d+)/)?.[1] ?? 0);
  return { os, browser, safariNew: ios && browser === "safari" && version >= 26 };
}
let cached: PwaState = SERVER_STATE;

export function getPwaState(): PwaState {
  if (typeof window === "undefined") return SERVER_STATE;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
  // Notificação local via service worker. No iPhone só existe com o app na tela inicial.
  const pushSupported = "serviceWorker" in navigator && "Notification" in window;
  const device = detectDevice(ua, navigator.maxTouchPoints, navigator.platform);
  const next: PwaState = {
    ...device,
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

// ── Alertas feitos pelo próprio navegador ─────────────────────────────────
// Os dados ficam no IndexedDB do aparelho e quem checa e notifica é o service
// worker (public/sw.js + public/alerts-core.js). Sem servidor de push.

export type AlertKinds = { drop: boolean; rise: boolean; stable: boolean };
export type LocalWatch = {
  path: string; name: string;
  /** true: o servidor checa de hora em hora e manda push (app fechado). */
  serverPush?: boolean;
  notifyDrop: boolean; notifyRise: boolean; notifyStable: boolean;
  basePrice: number; lastPrice: number; currentPrice?: number;
  lastChangeAt: string; lastNotifiedAt: string | null; createdAt: string; checkedAt?: string;
};

const SYNC_TAG = "dopamina-precos";
const BACKGROUND_INTERVAL = 12 * 3600_000;
const CHECK_ON_OPEN_EVERY = 3 * 3600_000;

async function swRegistration() {
  if (!("serviceWorker" in navigator)) throw new Error("sem service worker");
  await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  return navigator.serviceWorker.ready;
}

/** Envia um comando ao service worker e espera a resposta. */
async function swCall<T = Record<string, unknown>>(message: Record<string, unknown>): Promise<T & { ok: boolean; error?: string }> {
  const registration = await swRegistration();
  const worker = registration.active;
  if (!worker) throw new Error("service worker inativo");
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error("tempo esgotado")), 60_000);
    channel.port1.onmessage = event => { clearTimeout(timer); resolve(event.data); };
    worker.postMessage(message, [channel.port2]);
  });
}

export async function ensureNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) return "unsupported";
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  emit();
  return permission;
}

/** Ativa a checagem em segundo plano onde o navegador permite (Chrome/Edge com o app instalado). */
export async function enableBackgroundCheck(): Promise<boolean> {
  try {
    const registration = await swRegistration() as ServiceWorkerRegistration & { periodicSync?: { register: (tag: string, o: { minInterval: number }) => Promise<void> } };
    if (!registration.periodicSync) return false;
    const status = await navigator.permissions.query({ name: "periodic-background-sync" as PermissionName }).catch(() => null);
    if (status && status.state !== "granted") return false;
    await registration.periodicSync.register(SYNC_TAG, { minInterval: BACKGROUND_INTERVAL });
    return true;
  } catch { return false; }
}

export async function saveLocalWatch(input: { path: string; name: string; price: number; kinds: AlertKinds; serverPush?: boolean }) {
  const now = new Date().toISOString();
  const watch: LocalWatch = {
    path: input.path, name: input.name, serverPush: Boolean(input.serverPush),
    notifyDrop: input.kinds.drop, notifyRise: input.kinds.rise, notifyStable: input.kinds.stable,
    basePrice: input.price, lastPrice: input.price, currentPrice: input.price,
    lastChangeAt: now, lastNotifiedAt: null, createdAt: now, checkedAt: now,
  };
  const result = await swCall({ type: "save", watch });
  if (result.ok) rememberWatched(input.path, true);
  return result.ok;
}

export async function listLocalWatches() {
  return swCall<{ watches: LocalWatch[]; lastCheck: string | null }>({ type: "list" });
}

export async function removeLocalWatch(path: string) {
  await swCall({ type: "remove", path });
  rememberWatched(path, false);
  // Também para os avisos do servidor, se este aparelho estiver inscrito.
  const endpoint = await pushEndpoint().catch(() => null);
  if (endpoint) await fetch("/api/alerts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint, path }) }).catch(() => undefined);
}

// ── Push do servidor (avisos de hora em hora com o app fechado) ─────────
export const serverPushConfigured = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

function base64ToBytes(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

async function pushEndpoint(): Promise<string | null> {
  const registration = await swRegistration();
  const sub = await registration.pushManager?.getSubscription();
  return sub?.endpoint ?? null;
}

/**
 * Inscreve o aparelho no push e registra o alerta no servidor, que checa o preço
 * de hora em hora. Retorna false se o navegador ou o servidor não suportarem:
 * aí o alerta segue só com a checagem local.
 */
export async function registerServerAlert(input: { path: string; kinds: AlertKinds }): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return false;
  try {
    const registration = await swRegistration();
    if (!registration.pushManager) return false;
    const subscription = await registration.pushManager.getSubscription()
      ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(key) });
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON(), path: input.path, kinds: input.kinds }),
    });
    const data = await response.json().catch(() => null);
    return Boolean(response.ok && data?.ok);
  } catch {
    return false;
  }
}

export async function checkNow() {
  return swCall<{ report: { checked: number; notified: number; failed: number } }>({ type: "check" });
}

/** Mostra uma notificação pelo service worker (funciona também no app instalado do iPhone). */
export async function localNotification(title: string, body: string, url = "/alertas") {
  const registration = await swRegistration();
  await registration.showNotification(title, { body, icon: "/icons/icon-192.png", badge: "/icons/badge-96.png", tag: "dopamina-info", data: { url } });
}

/**
 * Ao abrir (ou voltar para) o app: se há alertas e a última checagem tem mais de
 * 3 horas, checa agora. É o que garante os avisos onde não há segundo plano (iPhone).
 */
let checking = false;
async function checkOnOpen() {
  if (checking || !("Notification" in window) || Notification.permission !== "granted") return;
  if (!watchedPaths().length) return;
  checking = true;
  try {
    const list = await listLocalWatches();
    const last = list.lastCheck ? Date.parse(list.lastCheck) : 0;
    if (list.watches.length && Date.now() - last > CHECK_ON_OPEN_EVERY) await checkNow();
  } catch { /* sem service worker ainda: tenta na próxima abertura */ } finally { checking = false; }
}

export function startCheckOnOpen() {
  void checkOnOpen();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") void checkOnOpen(); });
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

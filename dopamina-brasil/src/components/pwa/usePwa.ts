"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getPwaState, getServerPwaState, initPwa, subscribePwa } from "@/lib/pwa-client";

/** Estado de instalação/notificação do aparelho, reativo. */
export function usePwa() {
  useEffect(() => { initPwa(); }, []);
  return useSyncExternalStore(subscribePwa, getPwaState, getServerPwaState);
}

"use client";

import { useEffect } from "react";
import { initPwa } from "@/lib/pwa-client";

/** Registra o service worker e captura o convite de instalação (Android/desktop). */
export default function PwaInit() {
  useEffect(() => { initPwa(); }, []);
  return null;
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { usePwa } from "../pwa/usePwa";
import styles from "./nav.module.css";

/**
 * No app instalado não existe o botão Voltar do navegador (e nem todo Android
 * tem gesto de voltar). Fora da tela inicial do app, mostramos um no cabeçalho.
 */
export default function BackButton() {
  const { standalone } = usePwa();
  const router = useRouter();
  const pathname = usePathname();
  if (!standalone || pathname === "/") return null;
  function back() {
    // Entrou direto nesta página (link de notificação, compartilhamento): volta ao Início.
    if (window.history.length > 1) router.back();
    else router.push("/");
  }
  return <button type="button" className={styles.back} onClick={back} aria-label="Voltar"><ChevronLeft size={24} aria-hidden="true" /></button>;
}

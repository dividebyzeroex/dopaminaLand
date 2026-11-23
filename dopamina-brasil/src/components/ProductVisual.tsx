"use client";

import Image from "next/image";
import { useState } from "react";
import { Package } from "lucide-react";
import styles from "./studio.module.css";

export default function ProductVisual({ src, name, priority = false, halo = true }: { src?: string; name: string; priority?: boolean; /** Sombra suave sob o produto; desligada nas listas, onde vira uma mancha. */ halo?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const valid = src && (src.startsWith("/produtos/") || /^https:\/\//i.test(src));
  return <div className={styles.productVisual}>
    {halo && <div className={styles.productHalo} aria-hidden="true" />}
    {valid && failed !== src ? <Image src={src} alt={name} fill sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 480px" preload={priority} unoptimized={!src.startsWith("/")} onLoad={() => setLoaded(src)} onError={() => setFailed(src)} className={`${styles.productImage} ${loaded === src ? styles.imageLoaded : ""}`} /> : <div className={styles.imageFallback} role="img" aria-label="Imagem indisponível"><Package size={32} strokeWidth={1} /></div>}
  </div>;
}

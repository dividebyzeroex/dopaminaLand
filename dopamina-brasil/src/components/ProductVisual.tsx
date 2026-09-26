"use client";

import Image from "next/image";
import { useState } from "react";
import { Package } from "lucide-react";
import styles from "./studio.module.css";

export default function ProductVisual({ src, name, priority = false }: { src?: string; name: string; priority?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const valid = src && (src.startsWith("/produtos/") || /^https:\/\//i.test(src));
  return <div className={styles.productVisual}>
    <div className={styles.productHalo} aria-hidden="true" />
    {valid && failed !== src ? <Image src={src} alt={name} fill sizes="(max-width: 640px) 82vw, (max-width: 1024px) 45vw, 480px" preload={priority} unoptimized={!src.startsWith("/")} onLoad={() => setLoaded(src)} onError={() => setFailed(src)} className={`${styles.productImage} ${loaded === src ? styles.imageLoaded : ""}`} /> : <div className={styles.imageFallback}><Package size={40} strokeWidth={1} /><span>Imagem indisponível</span></div>}
  </div>;
}

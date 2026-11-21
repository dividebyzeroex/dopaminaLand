"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

type Props = {
  event: "search_results" | "product_view";
  product?: string;
  price?: number | null;
  metadata: Record<string, unknown>;
};

/**
 * Registra um evento quando uma página renderizada no servidor aparece para o visitante
 * (resultado de busca, página de produto). Não renderiza nada.
 */
export default function TrackOnce({ event, product, price, metadata }: Props) {
  const key = JSON.stringify([event, product, price, metadata]);
  useEffect(() => {
    trackEvent(event, product, price ?? undefined, metadata);
    // `key` resume todas as props: dispara de novo só quando o conteúdo muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

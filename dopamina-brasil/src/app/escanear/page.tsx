import type { Metadata } from "next";
import studio from "@/components/studio.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import { notFound } from "next/navigation";
import Scanner from "@/components/scan/Scanner";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = { title: "Escanear código de barras", robots: { index: false } };

export default function ScanPage() {
  if (!FEATURES.scanner) notFound();
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <Scanner />
    </div>
  </main>;
}

import type { Metadata } from "next";
import studio from "@/components/studio.module.css";
import SiteHeader from "@/components/price/SiteHeader";
import Scanner from "@/components/scan/Scanner";

export const metadata: Metadata = { title: "Escanear código de barras", robots: { index: false } };

export default function ScanPage() {
  return <main className={studio.shell}>
    <div className={studio.wrap}>
      <SiteHeader />
      <Scanner />
    </div>
  </main>;
}

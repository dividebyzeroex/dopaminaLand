import studio from "@/components/studio.module.css";

export default function Loading() {
  return <main className={studio.shell} aria-busy="true"><div className={studio.wrap}><p role="status" className={studio.status} style={{ paddingTop: 40 }}>Carregando…</p></div></main>;
}

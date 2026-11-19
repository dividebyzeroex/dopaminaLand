import Link from "next/link";
import studio from "../studio.module.css";

export default function SiteFooter() {
  return <footer className={studio.footer}>
    <span>© Dopamina · Comprar com clareza.</span>
    <span>Preços da fonte pública Buscapé, consultados no horário indicado. Confira loja, frete e condições antes de comprar. <Link href="/legal">Termos e privacidade</Link></span>
  </footer>;
}

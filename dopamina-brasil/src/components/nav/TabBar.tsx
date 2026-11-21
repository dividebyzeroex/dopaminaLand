"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, Home, Search } from "lucide-react";
import styles from "./nav.module.css";

const TABS = [
  { href: "/", label: "Início", Icon: Home, match: (p: string) => p === "/" },
  { href: "/busca", label: "Buscar", Icon: Search, match: (p: string) => p.startsWith("/busca") },
  { href: "/lista", label: "Minha lista", Icon: Heart, match: (p: string) => p.startsWith("/lista") || p.startsWith("/alertas") },
  { href: "/datas", label: "Datas", Icon: CalendarDays, match: (p: string) => p.startsWith("/datas") },
];

/**
 * Navegação principal no celular e no app instalado: quatro abas fixas embaixo,
 * ao alcance do polegar. Na página de produto quem ocupa a base é a barra de ações.
 */
export default function TabBar() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/produto/")) return null;
  return <>
    <div className={styles.spacer} aria-hidden="true" />
    <nav className={styles.tabs} aria-label="Navegação principal">
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return <Link key={href} href={href} className={active ? styles.tabOn : styles.tab} aria-current={active ? "page" : undefined}>
          <Icon size={22} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
          <span>{label}</span>
        </Link>;
      })}
    </nav>
  </>;
}

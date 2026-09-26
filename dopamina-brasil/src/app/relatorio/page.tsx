import Link from 'next/link';
import ReportClient from './report-client';
import { isBlockedSearch } from '@/lib/search-policy';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Relatório de preço | Dopamina',
  description: 'Consulte e compartilhe uma comparação pontual de preços com links para as ofertas encontradas.',
  robots: { index: false, follow: false },
};

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = typeof q === 'string' ? q.trim() : '';
  if (query.length < 3 || query.length > 120 || isBlockedSearch(query)) {
    return <main className="p-10">Informe um produto permitido para gerar o relatório. <Link href="/" className="underline">Voltar à busca</Link></main>;
  }
  return <ReportClient query={query} />;
}

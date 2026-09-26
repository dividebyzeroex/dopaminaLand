'use client';
import Link from 'next/link';

type Offer = { name: string; price: number; link: string };

export default function ReportClient({ query, checkedAt, offers }: { query: string; checkedAt: string; offers: Offer[] }) {
  const money = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  return <main className="max-w-3xl mx-auto p-6 sm:p-12 bg-white text-zinc-900 min-h-screen">
    <div className="flex justify-between items-start gap-4 print:hidden"><Link href="/" className="text-sm underline">← Nova busca</Link><button onClick={() => window.print()} className="rounded-lg bg-black text-white px-4 py-2">Imprimir ou salvar PDF</button></div>
    <h1 className="text-3xl font-bold mt-10">Relatório de compra consciente</h1>
    <p className="mt-3 text-zinc-600">Busca: {query}</p>
    <>
      <p className="mt-2 text-sm text-zinc-500">Consulta realizada em {new Date(checkedAt).toLocaleString('pt-BR')}. Preços e disponibilidade podem mudar.</p>
      <h2 className="text-xl font-semibold mt-10">Resultados encontrados</h2>
      <p className="text-sm text-zinc-600 mt-2">Compare modelo, vendedor, frete e forma de pagamento antes de decidir. Resultados da busca não garantem produtos idênticos.</p>
      <ol className="mt-6 space-y-4">{offers.map((offer, index) => <li key={`${offer.link}-${index}`} className="border rounded-xl p-4">
        <p className="font-semibold">{offer.name}</p><p className="text-lg mt-1">{money(offer.price)}</p>
        <a href={offer.link} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">Ver oferta original</a>
      </li>)}</ol>
      <p className="mt-10 text-sm text-zinc-600">Este relatório registra resultados encontrados em uma consulta pontual. Não inclui histórico de preços, previsão de queda, cashback nem validação de reputação das lojas.</p>
    </>
  </main>;
}

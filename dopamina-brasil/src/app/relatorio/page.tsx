import Stripe from 'stripe';
import Link from 'next/link';
import ReportClient from './report-client';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

type Offer = { name: string; price: number; link: string };

async function loadReport(sessionId: string): Promise<{ query: string; checkedAt: string; offers: Offer[] } | null> {
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId) || !process.env.STRIPE_SECRET_KEY) return null;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' || session.metadata?.type !== 'purchase_report' || !session.metadata.query) return null;
    const offers = Array.from({ length: 4 }, (_, i) => ({
      name: session.metadata?.[`offer_${i}_name`] || '',
      price: Number(session.metadata?.[`offer_${i}_price`]),
      link: session.metadata?.[`offer_${i}_link`] || '',
    })).filter(o => o.name && o.price > 0 && /^https:\/\//.test(o.link));
    if (!offers.length) return null;
    return { query: session.metadata.query, checkedAt: session.metadata.checked_at || '', offers };
  } catch {
    return null;
  }
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  const report = sessionId ? await loadReport(sessionId) : null;
  if (!report) return <main className="p-10">Relatório indisponível ou pagamento ainda não confirmado. <Link href="/" className="underline">Voltar à busca</Link></main>;
  return <ReportClient {...report} />;
}

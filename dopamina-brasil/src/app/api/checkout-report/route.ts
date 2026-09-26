import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { GET as getPriceHistory } from '../price-history/route';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Pagamento temporariamente indisponível.' }, { status: 503 });
  }

  let query: unknown;
  try {
    ({ query } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Busca inválida.' }, { status: 400 });
  }
  if (typeof query !== 'string' || query.trim().length < 3 || query.length > 120) {
    return NextResponse.json({ error: 'Informe um produto válido antes de continuar.' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.SITE_URL || 'https://www.dopaminado.com.br';
  try {
    const audit = await getPriceHistory(new NextRequest(`${origin}/api/price-history?q=${encodeURIComponent(query.trim())}`));
    if (!audit.ok) return NextResponse.json({ error: 'Não encontramos um preço verificável. Tente outro produto antes de pagar.' }, { status: 422 });
    const result = await audit.json();
    const offers = [{ name: result.scraped_name, price: result.scraped_price, link: result.url }, ...(result.market_alternatives || [])]
      .filter((offer: { name: string; price: number; link: string }) => offer.name && offer.price > 0 && /^https:\/\//.test(offer.link))
      .slice(0, 4);
    if (!offers.length) return NextResponse.json({ error: 'Nenhuma oferta verificável encontrada.' }, { status: 422 });
    // Persist the checked snapshot with the Checkout Session so delivery does not
    // depend on a second scrape after payment. Stripe metadata values cap at 500 chars.
    const metadata: Record<string, string> = { type: 'purchase_report', query: query.trim(), checked_at: result.checked_at };
    offers.forEach((offer: { name: string; price: number; link: string }, i: number) => {
      metadata[`offer_${i}_name`] = offer.name.slice(0, 480);
      metadata[`offer_${i}_price`] = String(offer.price);
      metadata[`offer_${i}_link`] = offer.link.slice(0, 480);
    });
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          unit_amount: 990,
          product_data: { name: 'Relatório de compra consciente', description: 'Cópia imprimível dos preços encontrados para um produto na consulta.' },
        },
        quantity: 1,
      }],
      metadata,
      success_url: `${origin}/relatorio?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Report checkout failed', error);
    return NextResponse.json({ error: 'Pagamento temporariamente indisponível.' }, { status: 502 });
  }
}

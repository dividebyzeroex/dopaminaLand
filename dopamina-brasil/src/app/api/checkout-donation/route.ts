import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-06-24.dahlia',
});

// Price ID for "Patrocinador Dopamina ⚡" (R$ 8,99)
const DONATION_PRICE_ID = process.env.STRIPE_DONATION_PRICE_ID || 'price_1TrLWkGuOimeX7c0gEe05SYl';

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get('host') || 'localhost:3333';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: DONATION_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/doacao/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      // We can pass metadata to identify the intent if needed
      metadata: {
        type: 'donation'
      }
    });

    if (!session.url) {
      throw new Error('Failed to create Stripe Checkout session');
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

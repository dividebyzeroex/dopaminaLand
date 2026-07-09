import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServiceSupabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const supabase = getServiceSupabase();
      
      // Insert placeholder for custom product
      const { error } = await supabase
        .from('donations_catalog')
        .insert({
          stripe_checkout_id: session.id,
          backer_name: session.customer_details?.name || 'Patrocinador Anônimo',
          // These will be filled by the user on the success page
          product_name: '',
          image_url: '',
          fake_price: 0,
          approved: false
        });

      if (error) {
        console.error('Failed to insert donation record:', error);
        // We still return 200 to Stripe so it doesn't retry endlessly, 
        // but log the error for manual recovery if needed.
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, targetPrice, contactMethod, contactValue, currentPrice } = body;

    if (!contactValue || !targetPrice) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // 1. Inserir no Supabase:
    const { error: dbError } = await supabase.from('price_alerts').insert({
      contact: contactValue,
      channel: contactMethod,
      product_name: productName,
      current_price: currentPrice || 0, // Fallback to 0 if not passed, but we should make sure it is passed
      target_price: targetPrice
    });

    if (dbError) {
      console.error("Erro ao inserir alerta no Supabase:", dbError);
    }

    // 2. Enviar confirmação de alerta criado via Zernio API
    const zernioApiKey = process.env.ZERNIO_API_KEY;
    
    if (zernioApiKey) {
      const messageText = `Olá! Seu alerta na Dopamina para o produto "${productName}" foi criado com sucesso. Avisaremos quando o preço cair para R$ ${targetPrice}.`;
      
      try {
        await fetch('https://zernio.com/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zernioApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: contactMethod === 'whatsapp' ? (process.env.ZERNIO_WHATSAPP_ID || "6a6a9042df17280d93dfd5c8") : undefined,
            to: contactValue,
            channel: contactMethod === 'whatsapp' ? 'whatsapp' : 'email',
            text: messageText
          })
        });
      } catch (err) {
        console.error("Erro ao enviar mensagem via Zernio:", err);
      }
    } else {
      // Simulate delay if no API key is present for local dev
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    return NextResponse.json({ success: true, message: "Alerta criado e integração Zernio acionada!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar alerta" }, { status: 500 });
  }
}

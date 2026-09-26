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
      return NextResponse.json({ error: "Não foi possível salvar o alerta. Tente novamente mais tarde." }, { status: 503 });
    }

    // 2. Enviar confirmação de alerta criado via Zernio API
    const zernioApiKey = process.env.ZERNIO_API_KEY;
    
    if (zernioApiKey) {
      const messageText = `Olá! Seu alerta na Dopamina para o produto "${productName}" foi criado com sucesso. Avisaremos quando o preço cair para R$ ${targetPrice}.`;
      
      try {
        // Formatar contato para garantir +55 no WhatsApp brasileiro, caso falte
        let formattedContact = contactValue;
        if (contactMethod === 'whatsapp' && !contactValue.startsWith('+')) {
          formattedContact = contactValue.startsWith('55') ? `+${contactValue}` : `+55${contactValue}`;
        }

        const res = await fetch('https://zernio.com/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zernioApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: contactMethod === 'whatsapp' ? (process.env.ZERNIO_WHATSAPP_ID || "6a6a9042df17280d93dfd5c8") : undefined,
            to: formattedContact,
            channel: contactMethod === 'whatsapp' ? 'whatsapp' : 'email',
            text: messageText
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Zernio API Error em dopamina-brasil:", errorText);
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem via Zernio:", err);
      }
    }

    return NextResponse.json({ success: true, message: "Alerta salvo. O envio da confirmação depende do canal estar configurado." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar alerta" }, { status: 500 });
  }
}

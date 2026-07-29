import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, channel, productName, targetPrice } = body;

    const zernioApiKey = process.env.ZERNIO_API_KEY;

    if (zernioApiKey) {
      const messageText = `🧪 [TESTE INSIGHTS] Olá! Este é um envio de teste do Painel H53. Produto: "${productName}", Alvo: R$ ${targetPrice}.`;
      
      try {
        // Formatar contato para garantir +55 no WhatsApp brasileiro, caso falte
        let formattedContact = contact;
        if (channel === 'whatsapp' && !contact.startsWith('+')) {
          formattedContact = contact.startsWith('55') ? `+${contact}` : `+55${contact}`;
        }

        const res = await fetch('https://zernio.com/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zernioApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: channel === 'whatsapp' ? (process.env.ZERNIO_WHATSAPP_ID || "6a6a9042df17280d93dfd5c8") : undefined,
            to: formattedContact,
            channel: channel === 'whatsapp' ? 'whatsapp' : 'email',
            text: messageText
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Zernio API Error:", errorText);
          return NextResponse.json({ error: "Erro na API Zernio", details: errorText }, { status: 400 });
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem de teste via Zernio:", err);
        return NextResponse.json({ error: "Falha de rede ao conectar com Zernio" }, { status: 500 });
      }
    } else {
      // Simulate delay for test
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({ error: "ZERNIO_API_KEY não configurada na Vercel/Ambiente!" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Mensagem de teste enviada via Zernio!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar envio de teste" }, { status: 500 });
  }
}

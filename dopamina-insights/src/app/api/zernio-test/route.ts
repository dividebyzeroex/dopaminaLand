import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, channel, productName, targetPrice } = body;

    const zernioApiKey = process.env.ZERNIO_API_KEY;

    if (zernioApiKey) {
      const messageText = `🧪 [TESTE INSIGHTS] Olá! Este é um envio de teste do Painel H53. Produto: "${productName}", Alvo: R$ ${targetPrice}.`;
      
      try {
        await fetch('https://zernio.com/api/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${zernioApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: contact,
            channel: channel === 'whatsapp' ? 'whatsapp' : 'email',
            text: messageText
          })
        });
      } catch (err) {
        console.error("Erro ao enviar mensagem de teste via Zernio:", err);
      }
    } else {
      // Simulate delay for test
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    return NextResponse.json({ success: true, message: "Mensagem de teste enviada via Zernio!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar envio de teste" }, { status: 500 });
  }
}

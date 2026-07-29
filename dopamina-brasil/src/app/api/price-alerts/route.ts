import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, targetPrice, contactMethod, contactValue } = body;

    if (!contactValue || !targetPrice) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    // Mock response for now
    // In a real scenario, we would insert this into Supabase:
    // await supabase.from('price_alerts').insert({ product_name: productName, target_price: targetPrice, contact_method: contactMethod, contact_value: contactValue })

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: "Alerta criado com sucesso (Mock)" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar alerta" }, { status: 500 });
  }
}

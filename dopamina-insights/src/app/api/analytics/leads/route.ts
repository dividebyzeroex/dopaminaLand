import { adminAccess } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase";
export async function GET(request: Request) {
  const denied = adminAccess(request);
  if (denied) return denied;
  try {
    const { data, error } = await getServiceSupabase().from("price_alerts")
      .select("id, contact, channel, product_name, current_price, target_price, created_at")
      .order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return Response.json({ data }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Não foi possível consultar os contatos." }, { status: 503 });
  }
}

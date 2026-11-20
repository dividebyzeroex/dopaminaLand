import { adminDb, alertsAvailable } from "@/lib/push";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!rateLimit(`alert-status:${clientIp(request.headers)}`, 20, 60_000).ok) {
    return Response.json({ ready: false }, { status: 429, headers });
  }
  if (!alertsAvailable() || !process.env.CRON_SECRET) {
    return Response.json({ ready: false }, { status: 503, headers });
  }
  try {
    const db = adminDb()!;
    // Probe schema access without returning subscription endpoints or user data.
    const results = await Promise.all([
      db.from("push_subscriptions").select("id", { head: true }).limit(0),
      db.from("price_watches").select("id", { head: true }).limit(0),
    ]);
    const ready = results.every(result => !result.error);
    return Response.json({ ready }, { status: ready ? 200 : 503, headers });
  } catch {
    return Response.json({ ready: false }, { status: 503, headers });
  }
}

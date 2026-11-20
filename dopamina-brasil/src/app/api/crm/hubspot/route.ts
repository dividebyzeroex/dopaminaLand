export async function POST() {
  return Response.json({ error: "Operação disponível somente no painel administrativo." }, { status: 410 });
}

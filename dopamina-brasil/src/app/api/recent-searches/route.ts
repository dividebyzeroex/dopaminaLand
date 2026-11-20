export async function GET() {
  return Response.json({ searches: ["iPhone 16", "PlayStation 5", "Samsung Galaxy S25", "Smart TV LG OLED", "MacBook Air"], source: "suggestions" });
}

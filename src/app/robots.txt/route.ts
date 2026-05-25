import { NextResponse } from "next/server";

export function GET() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: https://graveyard-gold.vercel.app/sitemap.xml`,
  ];
  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain" },
  });
}

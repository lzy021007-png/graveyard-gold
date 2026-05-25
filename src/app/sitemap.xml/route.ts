import { NextResponse } from "next/server";

const BASE = "https://graveyard-gold.vercel.app";

const pages = [
  { path: "", priority: "1.0" },
  { path: "/analyze", priority: "0.9" },
  { path: "/dashboard", priority: "0.8" },
  { path: "/privacy", priority: "0.3" },
  { path: "/terms", priority: "0.3" },
];

export function GET() {
  const urls = pages.map(
    (p) =>
      `  <url><loc>${BASE}${p.path}</loc><changefreq>weekly</changefreq><priority>${p.priority}</priority></url>`
  );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");
  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

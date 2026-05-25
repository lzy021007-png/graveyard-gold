import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "@/components/layout/header";
import { ClientProviders } from "@/components/layout/client-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Graveyard Gold – Validate Your Startup Idea Against 1,749 Failures",
    template: "%s | Graveyard Gold",
  },
  description:
    "Before you quit your job, let 1,749 dead startups review your idea. AI-powered startup idea validation based on real failure data.",
  keywords: ["startup validation", "idea validation", "failure analysis", "startup risk assessment", "AI startup analysis"],
  openGraph: {
    title: "Graveyard Gold – Validate Your Startup Idea Against 1,749 Failures",
    description: "AI-powered startup idea validation. Compare your idea against real failure patterns from startup history.",
    type: "website",
  },
  other: {
    "google": "notranslate",
    "googlebot": "notranslate",
    "bingbot": "notranslate",
    "msnbot": "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LHFJD77F8R" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LHFJD77F8R');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-200 notranslate">
        <ClientProviders>
          <Header />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}

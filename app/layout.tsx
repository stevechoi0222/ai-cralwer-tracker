import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/src/lib/site.config";
import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import JsonLd from "@/src/components/JsonLd";
import TrackingBeacons from "@/src/components/TrackingBeacons";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8 min-h-[60vh]">
          {children}
        </main>
        <Footer />

        {/* Tracking beacons - all 3 methods */}
        <TrackingBeacons />

        {/* Site-wide JSON-LD structured data */}
        <JsonLd
          id="organization"
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.url,
            description: siteConfig.description,
          }}
        />
        <JsonLd
          id="website"
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            description: siteConfig.description,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteConfig.url}/crawlers?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </body>
    </html>
  );
}

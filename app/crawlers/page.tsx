import type { Metadata } from "next";
import CrawlerTable from "@/src/components/CrawlerTable";
import JsonLd from "@/src/components/JsonLd";
import { siteConfig } from "@/src/lib/site.config";

export const metadata: Metadata = {
  title: "Crawler Visits",
  description: "Recent AI crawler and bot visits captured by the Cloudflare Worker tracking system.",
};

export default function CrawlersPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Crawler Visits</h1>
        <p className="text-gray-600">
          Recent requests captured by the Cloudflare Worker. Filter by bot type, user agent, IP,
          country, and more.
        </p>
      </div>

      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm">
        <strong>Note:</strong> Data is fetched directly from the Cloudflare Worker KV store and
        includes the last 200 requests. Logs are retained for 30 days.
      </div>

      <CrawlerTable />

      {/* Breadcrumb JSON-LD */}
      <JsonLd
        id="breadcrumb-crawlers"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteConfig.url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Crawler Visits",
              item: `${siteConfig.url}/crawlers`,
            },
          ],
        }}
      />
    </section>
  );
}

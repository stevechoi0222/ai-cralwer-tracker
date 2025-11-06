import type { Metadata } from "next";
import { siteConfig } from "@/src/lib/site.config";
import JsonLd from "@/src/components/JsonLd";

export const metadata: Metadata = {
  title: "Tutorials",
  description: "Learn how to track AI crawlers and bots visiting your website with Cloudflare Workers.",
};

export default function TutorialsPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Tutorials</h1>
        <p className="text-gray-600">
          Learn how to track AI crawlers and bots visiting your website.
        </p>
      </div>

      {/* Tutorial 1: Getting Started */}
      <article className="rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Getting Started with Crawler Tracking</h2>
        <p className="text-gray-600 text-sm">Last updated: November 2024</p>

        <div className="prose max-w-none space-y-4">
          <h3 className="text-xl font-semibold mt-6">Why Track Crawlers?</h3>
          <p>
            AI companies and search engines regularly crawl websites to train models and index content.
            Understanding which bots visit your site helps you:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Monitor data collection by AI training bots (GPTBot, Claude, etc.)</li>
            <li>Understand search engine indexing patterns</li>
            <li>Identify unwanted or malicious crawlers</li>
            <li>Analyze traffic sources beyond traditional analytics</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">How It Works</h3>
          <p>
            This system uses three complementary tracking methods to ensure comprehensive coverage:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>1x1 Pixel Image:</strong> A transparent GIF that loads when bots render images.
              Works for crawlers that process visual content.
            </li>
            <li>
              <strong>CSS Link Beacon:</strong> A stylesheet link that triggers when CSS is loaded.
              Catches bots that skip images but load styles.
            </li>
            <li>
              <strong>JavaScript Pixel:</strong> A client-side script that dynamically creates a tracking
              image. Captures JavaScript-enabled crawlers.
            </li>
          </ol>

          <h3 className="text-xl font-semibold mt-6">Implementation Overview</h3>
          <p>The tracking system consists of three components:</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p><strong>1. Cloudflare Worker</strong></p>
            <p className="text-sm text-gray-600">
              Handles tracking endpoints (/pixel.gif, /log.css, /api/logs) and stores visit data in
              Cloudflare KV.
            </p>

            <p className="mt-4"><strong>2. Tracking Beacons</strong></p>
            <p className="text-sm text-gray-600">
              Small code snippets embedded in your website that send requests to the Worker endpoints.
            </p>

            <p className="mt-4"><strong>3. Dashboard (This Site)</strong></p>
            <p className="text-sm text-gray-600">
              A Next.js application that fetches data from the Worker and displays it in a filterable table.
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-6">Setting Up the Worker</h3>
          <p>Create a Cloudflare Worker with the following endpoints:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><code className="bg-gray-100 px-2 py-0.5 rounded">/pixel.gif</code> - Returns a 1x1 transparent GIF</li>
            <li><code className="bg-gray-100 px-2 py-0.5 rounded">/log.css</code> - Returns an empty CSS file</li>
            <li><code className="bg-gray-100 px-2 py-0.5 rounded">/api/logs</code> - Returns stored visit records as JSON</li>
          </ul>
          <p className="text-sm text-gray-600 mt-2">
            Each request captures: timestamp, IP, user agent, location (country/city), ASN, referer, and requested path.
          </p>

          <h3 className="text-xl font-semibold mt-6">Adding Tracking to Your Site</h3>
          <p>Add the tracking beacons to your website's HTML:</p>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
{`<!-- 1. Pixel Image -->
<img src="https://your-worker.workers.dev/pixel.gif?token=YOUR_TOKEN&page=/page-path"
     width="1" height="1" alt="" referrerpolicy="origin-when-cross-origin">

<!-- 2. CSS Beacon -->
<link rel="stylesheet"
      href="https://your-worker.workers.dev/log.css?token=YOUR_TOKEN&page=/page-path"
      referrerpolicy="origin-when-cross-origin">

<!-- 3. JavaScript Beacon -->
<script>
(function(){
  var p = new Image();
  p.src = 'https://your-worker.workers.dev/pixel.gif?token=YOUR_TOKEN&page=' +
          encodeURIComponent(location.pathname);
})();
</script>`}
          </pre>

          <h3 className="text-xl font-semibold mt-6">Viewing the Data</h3>
          <p>
            Check the <a href="/crawlers" className="text-blue-600 hover:underline">Crawler Visits</a> page
            to see recent bot activity. Use the filters to find specific crawlers like GPTBot, Perplexity,
            or Claude.
          </p>

          <h3 className="text-xl font-semibold mt-6">Privacy Considerations</h3>
          <p className="text-gray-700">
            This tracking system captures technical metadata (IP, user agent) but doesn't use cookies
            or track personal information. It's designed specifically for bot detection, not user tracking.
            Consider your local privacy regulations and add appropriate disclosures if needed.
          </p>
        </div>
      </article>

      {/* Tutorial 2: Understanding Bot Types */}
      <article className="rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Understanding Different Bot Types</h2>
        <p className="text-gray-600 text-sm">Last updated: November 2024</p>

        <div className="prose max-w-none space-y-4">
          <h3 className="text-xl font-semibold mt-4">AI Training Bots</h3>
          <p>These bots crawl web content to train large language models:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>GPTBot</strong> - OpenAI's web crawler for ChatGPT training</li>
            <li><strong>Claude-Bot / Anthropic</strong> - Anthropic's crawler for Claude AI</li>
            <li><strong>PerplexityBot</strong> - Perplexity AI's search and training crawler</li>
            <li><strong>Cohere-Bot</strong> - Cohere's AI training crawler</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">Search Engine Crawlers</h3>
          <p>Traditional search engines indexing content for search results:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Googlebot</strong> - Google's web crawler</li>
            <li><strong>Bingbot</strong> - Microsoft Bing's crawler</li>
            <li><strong>DuckDuckBot</strong> - DuckDuckGo's crawler</li>
            <li><strong>Baiduspider</strong> - Baidu's search crawler</li>
            <li><strong>YandexBot</strong> - Yandex's search crawler</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">SEO & Analytics Bots</h3>
          <p>Commercial services that analyze websites:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>AhrefsBot</strong> - SEO analysis and backlink tracking</li>
            <li><strong>SemrushBot</strong> - SEO and competitive analysis</li>
            <li><strong>MJ12bot</strong> - Majestic SEO crawler</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">Social Media Bots</h3>
          <p>Platforms that preview links and fetch metadata:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>facebookexternalhit</strong> - Facebook link previews</li>
            <li><strong>Twitterbot</strong> - Twitter/X card previews</li>
            <li><strong>LinkedInBot</strong> - LinkedIn link previews</li>
          </ul>
        </div>
      </article>

      {/* Breadcrumb JSON-LD */}
      <JsonLd
        id="breadcrumb-tutorials"
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
              name: "Tutorials",
              item: `${siteConfig.url}/tutorials`,
            },
          ],
        }}
      />
    </section>
  );
}

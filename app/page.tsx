import Link from "next/link";
import { siteConfig } from "@/src/lib/site.config";

export default function HomePage() {
  return (
    <section className="space-y-8 py-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-xl text-gray-600">
          {siteConfig.tagline}
        </p>
        <p className="text-lg text-gray-700 max-w-2xl">
          {siteConfig.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
        <Link
          href="/crawlers"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
        >
          View Crawler Visits →
        </Link>
        <Link
          href="/tutorials"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Read Tutorials
        </Link>
      </div>

      <div className="pt-8 space-y-6">
        <h2 className="text-2xl font-semibold">Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6 space-y-2">
            <h3 className="font-semibold text-lg">Real-time Tracking</h3>
            <p className="text-gray-600 text-sm">
              Monitor AI crawlers and bots visiting your website in real-time using Cloudflare Workers.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 space-y-2">
            <h3 className="font-semibold text-lg">Multiple Detection Methods</h3>
            <p className="text-gray-600 text-sm">
              Uses pixel, CSS, and JavaScript beacons to ensure comprehensive bot detection.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6 space-y-2">
            <h3 className="font-semibold text-lg">Filter & Search</h3>
            <p className="text-gray-600 text-sm">
              Easily filter by bot type, user agent, IP, country, and more to find what you're looking for.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Tracked Bots</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "GPTBot (OpenAI)",
            "Claude (Anthropic)",
            "Perplexity",
            "Googlebot",
            "Bingbot",
            "ByteSpider (TikTok)",
            "DuckDuckBot",
            "AhrefsBot",
            "SemrushBot",
          ].map((bot) => (
            <span
              key={bot}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
            >
              {bot}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-8 rounded-lg bg-blue-50 border border-blue-200 p-6 space-y-2">
        <h3 className="font-semibold text-lg">How it works</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Cloudflare Worker intercepts requests to tracking endpoints</li>
          <li>Request metadata (UA, IP, location, etc.) is captured and stored in KV</li>
          <li>This Next.js app fetches and displays the data in real-time</li>
          <li>Filter and analyze which bots are crawling your content</li>
        </ol>
      </div>
    </section>
  );
}

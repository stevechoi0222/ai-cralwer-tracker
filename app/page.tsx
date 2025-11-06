"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { siteConfig } from "@/src/lib/site.config";
import { CrawlerEvent } from "@/src/types/crawler";
import { isBot, getBotName } from "@/src/lib/bots";
import { formatDistanceToNow } from "date-fns";

export default function HomePage() {
  const [data, setData] = useState<CrawlerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount and every 30 seconds
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${siteConfig.worker.endpoint}/api/logs`);
        url.searchParams.set("token", siteConfig.worker.token);
        url.searchParams.set("limit", "200");

        const res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const logs = await res.json();
        setData(Array.isArray(logs) ? logs : []);
      } catch (err) {
        console.error("Error fetching crawler data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRequests = data.length;
    const botVisits = data.filter((e) => isBot(e.ua)).length;
    const uniqueBots = new Set(
      data.filter((e) => isBot(e.ua)).map((e) => getBotName(e.ua))
    ).size;
    const botTrafficPercent =
      totalRequests > 0 ? Math.round((botVisits / totalRequests) * 100) : 0;

    return {
      totalRequests,
      botVisits,
      uniqueBots,
      botTrafficPercent,
    };
  }, [data]);

  // Get top crawlers
  const topCrawlers = useMemo(() => {
    const botCounts: Record<string, number> = {};
    data.forEach((e) => {
      const botName = getBotName(e.ua);
      if (botName) {
        botCounts[botName] = (botCounts[botName] || 0) + 1;
      }
    });

    return Object.entries(botCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  // Recent crawler activities (last 10)
  const recentActivities = useMemo(() => {
    return data
      .filter((e) => isBot(e.ua))
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 10);
  }, [data]);

  return (
    <section className="space-y-8 py-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-xl text-gray-600">{siteConfig.tagline}</p>
        <p className="text-lg text-gray-700 max-w-2xl">
          {siteConfig.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Link
          href="/crawlers"
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
        >
          View All Crawler Visits →
        </Link>
        <Link
          href="/tutorials"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Read Tutorials
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading crawler data...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stats Dashboard */}
      {!loading && !error && (
        <>
          <div className="pt-8 space-y-6">
            <h2 className="text-2xl font-semibold">Live Statistics</h2>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 space-y-2">
                <h3 className="font-semibold text-sm text-gray-600">
                  Total Requests
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalRequests}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 space-y-2">
                <h3 className="font-semibold text-sm text-gray-600">
                  Bot Visits
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.botVisits}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 space-y-2">
                <h3 className="font-semibold text-sm text-gray-600">
                  Unique Bots
                </h3>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.uniqueBots}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-6 space-y-2">
                <h3 className="font-semibold text-sm text-gray-600">
                  Bot Traffic
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.botTrafficPercent}%
                </p>
              </div>
            </div>
          </div>

          {/* Top Crawlers */}
          {topCrawlers.length > 0 && (
            <div className="pt-8 space-y-6">
              <h2 className="text-2xl font-semibold">Top Crawlers</h2>
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="space-y-4">
                  {topCrawlers.map((crawler, idx) => (
                    <div
                      key={crawler.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {crawler.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-semibold">
                        {crawler.count} visits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Crawler Activity */}
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Crawler Activity</h2>
              <Link
                href="/crawlers"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all →
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                No crawler visits yet. Waiting for bots to discover your site!
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((event, idx) => {
                  const botName = getBotName(event.ua);
                  const timestamp = event.ts ? new Date(event.ts) : null;
                  const timeAgo = timestamp
                    ? formatDistanceToNow(timestamp, { addSuffix: true })
                    : "Unknown";

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {botName && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                              {botName}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {timeAgo}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-gray-600 min-w-[100px]">
                            User Agent:
                          </span>
                          <span className="text-gray-700 break-all">
                            {event.ua || "-"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600 min-w-[100px]">
                              IP:
                            </span>
                            <span className="text-gray-700">
                              {event.ip || "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600 min-w-[100px]">
                              Location:
                            </span>
                            <span className="text-gray-700">
                              {[event.country, event.city]
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </span>
                          </div>

                          {event.asn && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-600 min-w-[100px]">
                                ASN:
                              </span>
                              <span className="text-gray-700">AS{event.asn}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600 min-w-[100px]">
                              Visited:
                            </span>
                            <span className="text-gray-700 truncate">
                              {event.path || event.page || event.url || "-"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600 min-w-[100px]">
                              Method:
                            </span>
                            <span className="text-gray-700">
                              {event.method || "-"}
                            </span>
                          </div>

                          {timestamp && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-600 min-w-[100px]">
                                Timestamp:
                              </span>
                              <span className="text-gray-700">
                                {timestamp.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* How It Works */}
      <div className="pt-8 rounded-lg bg-blue-50 border border-blue-200 p-6 space-y-2">
        <h3 className="font-semibold text-lg">How it works</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Cloudflare Worker intercepts requests to tracking endpoints</li>
          <li>
            Request metadata (UA, IP, location, etc.) is captured and stored in
            KV
          </li>
          <li>This Next.js app fetches and displays the data in real-time</li>
          <li>Filter and analyze which bots are crawling your content</li>
        </ol>
      </div>
    </section>
  );
}

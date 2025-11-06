"use client";

import { useEffect, useMemo, useState } from "react";
import { CrawlerEvent } from "@/src/types/crawler";
import { isBot, getBotName } from "@/src/lib/bots";
import { siteConfig } from "@/src/lib/site.config";
import { format } from "date-fns";

export default function CrawlerTable() {
  const [data, setData] = useState<CrawlerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyBots, setOnlyBots] = useState(false); // Changed to false to show all visits by default
  const [filterQuery, setFilterQuery] = useState("");

  // Fetch data on mount
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
        console.log('Fetched logs:', logs); // Debug: see what data we got
        console.log('Number of logs:', Array.isArray(logs) ? logs.length : 0); // Debug: count
        setData(Array.isArray(logs) ? logs : []);
      } catch (err) {
        console.error("Error fetching crawler data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort data
  const rows = useMemo(() => {
    const filtered = data
      .filter((e) => (onlyBots ? isBot(e.ua) : true))
      .filter((e) =>
        filterQuery
          ? JSON.stringify(e).toLowerCase().includes(filterQuery.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

    console.log('Total data:', data.length, 'After filters:', filtered.length, 'Bots only:', onlyBots); // Debug
    return filtered;
  }, [data, onlyBots, filterQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading crawler data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyBots}
            onChange={(e) => setOnlyBots(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Show bots only</span>
        </label>
        <input
          className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Filter by UA, IP, country, path..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
        />
        <div className="text-sm text-gray-500">
          {rows.length} {rows.length === 1 ? "result" : "results"}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No crawler visits found. Try adjusting your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Time</th>
                <th className="px-4 py-3 font-medium text-gray-700">Bot</th>
                <th className="px-4 py-3 font-medium text-gray-700">User Agent</th>
                <th className="px-4 py-3 font-medium text-gray-700">IP / ASN</th>
                <th className="px-4 py-3 font-medium text-gray-700">Location</th>
                <th className="px-4 py-3 font-medium text-gray-700">Method</th>
                <th className="px-4 py-3 font-medium text-gray-700">Path</th>
                <th className="px-4 py-3 font-medium text-gray-700">Referer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((event, idx) => {
                const botName = getBotName(event.ua);
                const timestamp = event.ts ? new Date(event.ts) : null;

                return (
                  <tr key={idx} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {timestamp ? format(timestamp, "MMM dd, HH:mm:ss") : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {botName ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {botName}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="truncate text-gray-700" title={event.ua}>
                        {event.ua || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {event.ip || "-"}
                      {event.asn && (
                        <div className="text-xs text-gray-500">AS{event.asn}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {[event.country, event.city, event.colo]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {event.method || "-"}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="break-all text-gray-700">
                        {event.path || event.page || event.url || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="break-all text-gray-600">
                        {event.referer || "-"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tip */}
      <p className="text-xs text-gray-500">
        💡 Tip: Toggle "bots only" and use the filter to find specific crawlers like GPTBot,
        Perplexity, Claude, etc.
      </p>
    </div>
  );
}

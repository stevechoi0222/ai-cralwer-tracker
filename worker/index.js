/**
 * Cloudflare Worker for tracking crawler visits
 *
 * Endpoints:
 * - /pixel.gif - Returns 1x1 transparent GIF (tracks via image)
 * - /log.css - Returns empty CSS (tracks via stylesheet)
 * - /api/logs - Returns stored logs as JSON
 *
 * KV Namespace: LOGS
 */

// 1x1 transparent GIF in base64
const GIF_BASE64 = 'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const GIF_BYTES = Uint8Array.from(atob(GIF_BASE64), c => c.charCodeAt(0));

// Empty CSS
const EMPTY_CSS = '/* tracker */';

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: CORS_HEADERS
      });
    }

    // Endpoint: /pixel.gif - Image tracking beacon
    if (url.pathname === '/pixel.gif') {
      await logRequest(request, env, url);

      return new Response(GIF_BYTES, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Expires': '0',
          ...CORS_HEADERS
        }
      });
    }

    // Endpoint: /log.css - CSS tracking beacon
    if (url.pathname === '/log.css') {
      await logRequest(request, env, url);

      return new Response(EMPTY_CSS, {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Expires': '0',
          ...CORS_HEADERS
        }
      });
    }

    // Endpoint: /api/logs - Retrieve stored logs
    if (url.pathname === '/api/logs') {
      return await getLogs(request, env, url);
    }

    // Default response
    return new Response('Crawler Tracker Worker', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};

/**
 * Log request to KV storage
 */
async function logRequest(request, env, url) {
  try {
    const now = new Date();
    const cf = request.cf || {};

    // Extract data from query params
    const token = url.searchParams.get('token') || '';
    const page = url.searchParams.get('page') || '';

    // Build log record
    const record = {
      ts: now.toISOString(),

      // Request metadata
      method: request.method,
      url: url.toString(),
      path: url.pathname,
      page: page,
      token: token,

      // Headers
      ua: request.headers.get('User-Agent') || undefined,
      referer: request.headers.get('Referer') || undefined,

      // Cloudflare metadata (if available)
      ip: request.headers.get('CF-Connecting-IP') || undefined,
      country: cf.country || undefined,
      city: cf.city || undefined,
      colo: cf.colo || undefined,
      asn: cf.asn || undefined,
      asOrganization: cf.asOrganization || undefined,

      // Additional headers (optional)
      headers: {
        'accept': request.headers.get('Accept'),
        'accept-language': request.headers.get('Accept-Language'),
        'accept-encoding': request.headers.get('Accept-Encoding'),
      }
    };

    // Generate unique key: log:timestamp:uuid
    const key = `log:${Date.now()}:${crypto.randomUUID()}`;

    // Store in KV with 30-day expiration
    await env.LOGS.put(key, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 30  // 30 days
    });

    console.log('Logged:', key, record.ua);
  } catch (err) {
    console.error('Error logging request:', err);
  }
}

/**
 * Retrieve logs from KV storage
 */
async function getLogs(request, env, url) {
  try {
    // Optional token validation
    const expectedToken = 'sandbox-2025-11-05'; // Change this to your token
    const providedToken = url.searchParams.get('token');

    // Uncomment to require token:
    // if (providedToken !== expectedToken) {
    //   return new Response('Unauthorized', { status: 403 });
    // }

    // Get limit from query params (default 200, max 1000)
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '200'),
      1000
    );

    // List all log keys
    const { keys } = await env.LOGS.list({
      prefix: 'log:',
      limit: limit
    });

    // Fetch all log values
    const logPromises = keys.map(key => env.LOGS.get(key.name));
    const logValues = await Promise.all(logPromises);

    // Parse and filter out nulls
    const logs = logValues
      .filter(val => val !== null)
      .map(val => JSON.parse(val));

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

    return new Response(JSON.stringify(logs), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        ...CORS_HEADERS
      }
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      }
    });
  }
}

# Deploy Worker via Cloudflare Dashboard (No CLI Needed!)

Since wrangler CLI has issues on Windows, we'll deploy directly through the Cloudflare web dashboard.

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for free account (no credit card required)
3. Verify your email

## Step 2: Create KV Namespace

1. Go to https://dash.cloudflare.com
2. In left sidebar, click **Workers & Pages**
3. Click **KV** tab at the top
4. Click **Create a namespace** button
5. Name it: `LOGS`
6. Click **Add**
7. **Copy the Namespace ID** (looks like: `abc123def456...`) - you'll need this!

## Step 3: Create Worker

1. Still in **Workers & Pages**, click **Overview** tab
2. Click **Create** button
3. Select **Create Worker**
4. Name it: `ai-logger` (or your preferred name)
5. Click **Deploy**

## Step 4: Edit Worker Code

1. After deploying, click **Edit code** button (top right)
2. You'll see a code editor with default worker code
3. **Delete all the default code**
4. Copy the code from `worker/index.js` in this repo
5. **Paste it into the editor**
6. Click **Save and deploy** (top right)

Here's the code to copy:

```javascript
/**
 * Cloudflare Worker for tracking crawler visits
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
    const expectedToken = 'sandbox-2025-11-05';
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
```

## Step 5: Bind KV Namespace

1. Click **Settings** tab (top of worker page)
2. Scroll to **Variables and Secrets** section
3. Under **KV Namespace Bindings**, click **Add binding**
4. Variable name: `LOGS`
5. KV namespace: Select the `LOGS` namespace you created in Step 2
6. Click **Save**
7. Click **Deploy** button at top

## Step 6: Get Your Worker URL

After deployment, you'll see your Worker URL at the top:
```
https://ai-logger.YOUR-SUBDOMAIN.workers.dev
```

Copy this URL!

## Step 7: Update Next.js Site

1. Open `.env.local` in your project
2. Update the Worker URL:
   ```
   NEXT_PUBLIC_CF_WORKER=https://ai-logger.YOUR-SUBDOMAIN.workers.dev
   NEXT_PUBLIC_CF_TOKEN=sandbox-2025-11-05
   ```
3. Rebuild and redeploy:
   ```bash
   npm run build
   cp -r out/* .
   git add .
   git commit -m "Update worker URL"
   git push
   ```

## Step 8: Test It!

### Test in Browser:

1. Visit: `https://ai-logger.YOUR-SUBDOMAIN.workers.dev/pixel.gif?token=sandbox-2025-11-05&page=/test`
   - Should show a tiny transparent image
   - Check network tab - should return status 200

2. Visit: `https://ai-logger.YOUR-SUBDOMAIN.workers.dev/api/logs?token=sandbox-2025-11-05&limit=5`
   - Should show JSON array with your test request!

### Test on Your Site:

1. Visit your GitHub Pages site: `https://stevechoi0222.github.io/ai-cralwer-tracker/`
2. Open browser DevTools → Network tab
3. You should see requests to your Worker:
   - `pixel.gif?token=...&page=/`
   - `log.css?token=...&page=/`

4. Visit the crawlers page: `https://stevechoi0222.github.io/ai-cralwer-tracker/crawlers`
5. You should see your own visit in the table!

## Troubleshooting

### "env.LOGS is undefined" error?

You forgot to bind the KV namespace:
1. Go to Worker → Settings → KV Namespace Bindings
2. Add: Variable name = `LOGS`, Namespace = your LOGS namespace
3. Save and deploy

### No data showing in /api/logs?

1. Check Worker logs:
   - Go to Worker → Logs tab (real-time)
   - Or click "Begin log stream"
2. Visit a tracking URL
3. See if errors appear in logs

### CORS errors?

Make sure CORS_HEADERS are in all Response objects in the code.

### KV data not persisting?

Check KV directly:
1. Go to Workers & Pages → KV
2. Click your LOGS namespace
3. Browse keys starting with `log:`
4. You should see stored records

## Viewing Stored Data

To see what's actually stored in KV:

1. Go to https://dash.cloudflare.com
2. Workers & Pages → KV → LOGS namespace
3. Click "View" next to the namespace
4. You'll see all keys like: `log:1699999999999:uuid`
5. Click a key to see the JSON data

## Next Steps

Once deployed:
- ✅ All visitors to your GitHub Pages site will be tracked
- ✅ Bot visits will be stored for 30 days
- ✅ `/crawlers` page will show live data
- ✅ Share your site and watch the bots appear!

## Cost

**100% FREE** on Cloudflare's free tier:
- 100,000 Worker requests/day
- 1 GB KV storage
- More than enough for tracking!

## Need Help?

If you get stuck:
1. Check Worker logs in the dashboard
2. Test endpoints directly in browser
3. Look at Network tab in browser DevTools
4. Check KV namespace has data stored

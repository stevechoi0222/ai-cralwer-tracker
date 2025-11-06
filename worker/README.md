# Cloudflare Worker Setup Guide

This Worker captures crawler/bot visits and stores them in Cloudflare KV.

## Prerequisites

- Cloudflare account (free tier works!)
- Node.js installed
- Wrangler CLI (`npm install -g wrangler`)

## Setup Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser to authenticate.

### 3. Create KV Namespace

```bash
# Create KV namespace for production
wrangler kv:namespace create LOGS

# This will output something like:
# { binding = "LOGS", id = "abc123def456..." }
```

Copy the `id` value (e.g., `abc123def456...`)

### 4. Update wrangler.toml

Edit `wrangler.toml` and replace `YOUR_KV_NAMESPACE_ID` with the ID from step 3:

```toml
[[kv_namespaces]]
binding = "LOGS"
id = "abc123def456..."  # Your actual KV namespace ID
```

### 5. Deploy the Worker

```bash
cd worker
wrangler deploy
```

You'll see output like:
```
✨ Success! Uploaded ai-logger
Published ai-logger (0.01 sec)
  https://ai-logger.stevechoi0222.workers.dev
```

### 6. Test the Worker

Test the endpoints:

```bash
# Test pixel endpoint
curl https://ai-logger.stevechoi0222.workers.dev/pixel.gif?token=sandbox-2025-11-05&page=/test

# Test CSS endpoint
curl https://ai-logger.stevechoi0222.workers.dev/log.css?token=sandbox-2025-11-05&page=/test

# Test logs API
curl "https://ai-logger.stevechoi0222.workers.dev/api/logs?token=sandbox-2025-11-05&limit=5"
```

The logs endpoint should return JSON array of visits.

## How It Works

### Tracking Endpoints

**1. `/pixel.gif`** - Image beacon
- Returns a 1x1 transparent GIF
- Captures request when image loads
- Works for bots that render images

**2. `/log.css`** - CSS beacon
- Returns empty CSS file
- Captures request when CSS loads
- Works for bots that load stylesheets

Both endpoints:
- Log request metadata to KV
- Extract: UA, IP, location, ASN, referer
- Store with 30-day expiration

### Data Retrieval

**`/api/logs`** - Get stored logs
- Query params:
  - `token`: Optional authentication token
  - `limit`: Max records to return (default 200, max 1000)
- Returns JSON array of log records
- Sorted by timestamp (newest first)

### Data Structure

Each log record contains:
```json
{
  "ts": "2025-11-06T10:30:00.000Z",
  "method": "GET",
  "url": "https://worker.dev/pixel.gif?token=...",
  "path": "/pixel.gif",
  "page": "/crawlers",
  "token": "sandbox-2025-11-05",
  "ua": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "referer": "https://example.com",
  "ip": "66.249.66.1",
  "country": "US",
  "city": "Mountain View",
  "colo": "SJC",
  "asn": 15169,
  "asOrganization": "Google LLC",
  "headers": {
    "accept": "text/html,application/xhtml+xml",
    "accept-language": "en-US,en;q=0.9",
    "accept-encoding": "gzip, deflate, br"
  }
}
```

## Security

### Token Validation (Optional)

To require a token for `/api/logs`, uncomment these lines in `index.js`:

```javascript
if (providedToken !== expectedToken) {
  return new Response('Unauthorized', { status: 403 });
}
```

### CORS

Worker allows cross-origin requests from any domain. To restrict:

```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  // ...
};
```

## Viewing Logs in Dashboard

1. Go to https://dash.cloudflare.com
2. Workers & Pages → ai-logger
3. KV → LOGS namespace
4. Browse keys starting with `log:`

## Cost

Cloudflare Free Tier includes:
- ✅ 100,000 Worker requests/day
- ✅ 1 GB KV storage
- ✅ 100,000 KV reads/day
- ✅ 1,000 KV writes/day

This is plenty for most tracking use cases!

## Troubleshooting

### No data appearing?

1. Check Worker is deployed: `wrangler deployments list`
2. Check KV namespace is bound correctly in wrangler.toml
3. Test endpoints with curl
4. Check Worker logs: `wrangler tail`

### CORS errors?

Make sure CORS_HEADERS are included in all responses.

### KV quota exceeded?

Free tier has limits. Either:
- Reduce expiration time (currently 30 days)
- Delete old logs: `wrangler kv:key delete --namespace-id=XXX "log:..."`
- Upgrade to paid plan

## Development

### Local testing

```bash
wrangler dev
```

This runs the Worker locally at http://localhost:8787

### View real-time logs

```bash
wrangler tail
```

Shows live requests as they happen.

## Integration with Next.js Site

The Next.js site is already configured to:

1. **Send tracking requests** (via TrackingBeacons component):
   - Loads `/pixel.gif?token=...&page=...`
   - Loads `/log.css?token=...&page=...`
   - Executes JS that creates dynamic pixel

2. **Fetch logs** (via CrawlerTable component):
   - Calls `/api/logs?token=...&limit=200`
   - Displays in interactive table
   - Auto-refreshes every 30 seconds

No changes needed to Next.js site - it already works with this Worker!

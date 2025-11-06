# Complete Tracking Flow

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VISITOR LANDS ON SITE                        │
│                 https://stevechoi0222.github.io/...                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              NEXT.JS PAGE LOADS (app/layout.tsx)                    │
│                                                                     │
│  • Header, Footer, Content                                         │
│  • TrackingBeacons component automatically included                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              TrackingBeacons Component Fires                        │
│              (src/components/TrackingBeacons.tsx)                   │
│                                                                     │
│  Sends 3 simultaneous tracking requests:                           │
│                                                                     │
│  1. <img src="https://ai-logger.../pixel.gif?token=...&page=...">  │
│  2. <link href="https://ai-logger.../log.css?token=...&page=...">  │
│  3. <script> new Image().src = "...pixel.gif?token=...&page=..."   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKER RECEIVES REQUESTS                    │
│              https://ai-logger.stevechoi0222.workers.dev            │
│                                                                     │
│  Endpoint: /pixel.gif  or  /log.css                                │
│                                                                     │
│  Worker captures:                                                  │
│  • Timestamp                                                       │
│  • User Agent (identifies bots)                                    │
│  • IP Address                                                      │
│  • Country, City, Datacenter (from Cloudflare)                     │
│  • ASN & Organization                                              │
│  • Referer                                                         │
│  • Page visited                                                    │
│  • Headers                                                         │
│                                                                     │
│  Stores in: Cloudflare KV                                          │
│  Key: log:1699999999999:uuid-here                                  │
│  TTL: 30 days                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE KV STORAGE                                  │
│                                                                     │
│  log:1699999999999:abc123 → {                                      │
│    "ts": "2025-11-06T10:30:00Z",                                   │
│    "ua": "Mozilla/5.0 (compatible; Googlebot/2.1; ...)",           │
│    "ip": "66.249.66.1",                                            │
│    "country": "US",                                                │
│    "city": "Mountain View",                                        │
│    "asn": 15169,                                                   │
│    "asOrganization": "Google LLC",                                 │
│    "page": "/crawlers",                                            │
│    ...                                                             │
│  }                                                                 │
│                                                                     │
│  Retention: 30 days, then auto-deleted                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              USER VISITS /crawlers PAGE                             │
│                                                                     │
│  CrawlerTable component loads                                      │
│  (src/components/CrawlerTable.tsx)                                 │
│                                                                     │
│  Fetches: GET /api/logs?token=...&limit=200                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKER /api/logs ENDPOINT                   │
│                                                                     │
│  1. Lists all KV keys with prefix "log:"                           │
│  2. Fetches up to 200 records                                      │
│  3. Parses JSON                                                    │
│  4. Sorts by timestamp (newest first)                              │
│  5. Returns as JSON array                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              NEXT.JS DISPLAYS DATA                                  │
│                                                                     │
│  • Detects bots using regex (getBotName function)                  │
│  • Shows in filterable table                                       │
│  • User can:                                                       │
│    - Toggle "show bots only"                                       │
│    - Search/filter by UA, IP, country, path                        │
│    - See: time, bot name, IP, location, method, path              │
└─────────────────────────────────────────────────────────────────────┘
```

## Current Implementation Status

### ✅ DONE (Next.js Site)

**TrackingBeacons Component** (`src/components/TrackingBeacons.tsx`):
- Line 16: Creates pixel URL with token & page
- Line 17: Creates CSS URL with token & page
- Lines 22-29: Pixel image beacon
- Lines 32-36: CSS link beacon
- Lines 39-60: JavaScript pixel beacon

**CrawlerTable Component** (`src/components/CrawlerTable.tsx`):
- Line 23: Builds Worker API URL
- Line 24: Adds token parameter
- Line 25: Requests 200 logs
- Line 27: Fetches data from Worker
- Line 48: Filters for bots only
- Line 49: Applies search filter

**Site Configuration** (`.env.local`):
```
NEXT_PUBLIC_CF_WORKER=https://ai-logger.stevechoi0222.workers.dev
NEXT_PUBLIC_CF_TOKEN=sandbox-2025-11-05
```

### ⏳ TODO (Cloudflare Worker)

You need to:
1. Deploy the Worker code (`worker/index.js`)
2. Create KV namespace
3. Bind KV to Worker
4. Test endpoints

## Deployment Steps

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace

```bash
cd worker
wrangler kv:namespace create LOGS
```

Copy the `id` from output.

### 4. Update wrangler.toml

Replace `YOUR_KV_NAMESPACE_ID` with the ID from step 3.

### 5. Deploy Worker

```bash
wrangler deploy
```

You'll see: `https://ai-logger.stevechoi0222.workers.dev`

### 6. Test It

```bash
# Test tracking
curl "https://ai-logger.stevechoi0222.workers.dev/pixel.gif?token=sandbox-2025-11-05&page=/test"

# Should return 1x1 GIF
# Data is now stored in KV

# Test retrieval
curl "https://ai-logger.stevechoi0222.workers.dev/api/logs?token=sandbox-2025-11-05&limit=5"

# Should return JSON array like:
# [{"ts":"2025-11-06T...","ua":"curl/...","ip":"..."}]
```

### 7. Verify on Next.js Site

1. Visit: `https://stevechoi0222.github.io/ai-cralwer-tracker/crawlers`
2. You should see the curl request you just made!
3. Visit other pages - they'll be tracked automatically
4. Bots that crawl your site will appear in the table

## How Tracking Actually Works

### When a page loads:

1. **HTML renders** with TrackingBeacons component
2. **Browser makes 3 requests**:
   ```
   GET /pixel.gif?token=sandbox-2025-11-05&page=/crawlers
   GET /log.css?token=sandbox-2025-11-05&page=/crawlers
   GET /pixel.gif?token=sandbox-2025-11-05&page=/crawlers&ts=1699999999
   ```
3. **Worker receives each request**
4. **Worker extracts metadata**:
   ```javascript
   {
     ua: request.headers.get('User-Agent'),
     ip: request.headers.get('CF-Connecting-IP'),
     country: request.cf.country,
     city: request.cf.city,
     asn: request.cf.asn,
     // ... etc
   }
   ```
5. **Stores in KV**:
   ```javascript
   await env.LOGS.put(
     'log:1699999999999:uuid',
     JSON.stringify(record),
     { expirationTtl: 2592000 }  // 30 days
   );
   ```

### When /crawlers page loads:

1. **CrawlerTable fetches**:
   ```javascript
   fetch('https://ai-logger.../api/logs?token=...&limit=200')
   ```
2. **Worker queries KV**:
   ```javascript
   const { keys } = await env.LOGS.list({ prefix: 'log:', limit: 200 });
   const logs = await Promise.all(keys.map(k => env.LOGS.get(k.name)));
   ```
3. **Returns JSON array**
4. **React displays** in table with filtering

## Why 3 Different Tracking Methods?

Different bots behave differently:

| Method | Triggered By | Catches |
|--------|-------------|---------|
| `<img>` | Image loading | Bots that render images (Googlebot, some AI bots) |
| `<link rel="stylesheet">` | CSS loading | Bots that load styles but skip images |
| `<script>` JS pixel | JavaScript execution | JS-enabled crawlers, browser-based bots |

Using all 3 ensures maximum coverage!

## Data Flow Summary

```
Visitor → TrackingBeacons → Worker → KV Storage
                                         ↓
CrawlerTable ← /api/logs endpoint ← KV Storage
```

## Next Steps

1. **Deploy the Worker** (see steps above)
2. **Test with curl** to verify endpoints work
3. **Visit your GitHub Pages site** to see tracking in action
4. **Share your site** and watch bots appear!

The Next.js site is **already configured** to use the Worker. Once you deploy it, everything will work automatically!

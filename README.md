# AI Crawler Tracker

A Next.js application for tracking and analyzing AI crawler and bot visits to your website using Cloudflare Workers.

## Features

- **Real-time Tracking**: Monitor AI crawlers (GPTBot, Claude, Perplexity, etc.) and search engine bots
- **Multiple Detection Methods**: Uses pixel, CSS, and JavaScript beacons for comprehensive coverage
- **Interactive Dashboard**: Filter and search crawler visits by bot type, IP, country, user agent, and more
- **SEO Optimized**: Includes robots.txt, sitemap.xml, and JSON-LD structured data
- **Static Export**: Deploys to GitHub Pages with full SSG (Static Site Generation)

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Cloudflare Workers** (backend tracking)
- **Cloudflare KV** (data storage)

## Project Structure

```
├── app/
│   ├── crawlers/page.tsx      # Crawler visits dashboard
│   ├── tutorials/page.tsx     # Setup tutorials
│   ├── layout.tsx             # Root layout with tracking
│   ├── page.tsx               # Home page
│   ├── robots.ts              # robots.txt generation
│   └── sitemap.ts             # sitemap.xml generation
├── src/
│   ├── components/
│   │   ├── CrawlerTable.tsx   # Filterable data table
│   │   ├── TrackingBeacons.tsx # All 3 tracking methods
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── JsonLd.tsx         # SEO structured data
│   ├── lib/
│   │   ├── site.config.ts     # Site configuration
│   │   └── bots.ts            # Bot detection utilities
│   └── types/
│       └── crawler.ts         # TypeScript types
├── public/
│   ├── .nojekyll              # GitHub Pages config
│   └── googled32bf9cee2a13e4b.html
└── out/                       # Static export output
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Cloudflare Worker with tracking endpoints (see Worker Setup below)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stevechoi0222/ai-cralwer-tracker.git
cd ai-cralwer-tracker
```

2. Install dependencies:
```bash
npm install --ignore-scripts
```

3. Configure environment variables:

Create `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://stevechoi0222.github.io/ai-cralwer-tracker
NEXT_PUBLIC_CF_WORKER=https://ai-logger.stevechoi0222.workers.dev
NEXT_PUBLIC_CF_TOKEN=sandbox-2025-11-05
```

4. Run development server:
```bash
npm run dev
```

Visit http://localhost:3000

### Build for Production

Build static site:
```bash
npm run build
```

Output will be in the `out/` directory.

## Cloudflare Worker Setup

The tracking system requires a Cloudflare Worker with these endpoints:

### Required Endpoints

1. **`/pixel.gif`** - Returns 1x1 transparent GIF
2. **`/log.css`** - Returns empty CSS file
3. **`/api/logs`** - Returns JSON array of stored visits

### Worker Implementation

```javascript
// Simplified example - see full implementation in Worker code

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname === '/pixel.gif') {
      // Capture and store request metadata
      const record = {
        ts: new Date().toISOString(),
        ua: req.headers.get('user-agent'),
        ip: req.headers.get('cf-connecting-ip'),
        // ... more metadata
      };
      await env.LOGS.put(`log:${Date.now()}:${crypto.randomUUID()}`, JSON.stringify(record));
      return new Response(GIF_BYTES, { headers: { 'content-type': 'image/gif' } });
    }

    if (url.pathname === '/api/logs') {
      const { keys } = await env.LOGS.list({ prefix: 'log:', limit: 200 });
      const logs = await Promise.all(keys.map(k => env.LOGS.get(k.name)));
      return new Response(JSON.stringify(logs.map(JSON.parse)), {
        headers: { 'content-type': 'application/json' }
      });
    }
  }
};
```

### KV Namespace Setup

In `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "LOGS"
id = "your-kv-namespace-id"
```

## Deployment to GitHub Pages

1. **Update configuration**:
   - Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to your GitHub Pages URL
   - Verify `basePath` in `next.config.mjs` matches your repo name

2. **Build**:
```bash
npm run build
```

3. **Deploy**:

Option A - Manual:
```bash
# Copy out/ directory contents to gh-pages branch
git checkout -b gh-pages
cp -r out/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Option B - GitHub Actions (create `.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci --ignore-scripts
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Set source to `gh-pages` branch
   - Save

## Tracking Methods

The app implements three complementary tracking methods:

### 1. Pixel Image Beacon
```html
<img src="https://worker.dev/pixel.gif?token=TOKEN&page=/path"
     width="1" height="1" alt="">
```

### 2. CSS Link Beacon
```html
<link rel="stylesheet"
      href="https://worker.dev/log.css?token=TOKEN&page=/path">
```

### 3. JavaScript Pixel
```javascript
(function(){
  var p = new Image();
  p.src = 'https://worker.dev/pixel.gif?token=TOKEN&page=' + location.pathname;
})();
```

## Configuration

### Site Configuration

Edit `src/lib/site.config.ts`:
```typescript
export const siteConfig = {
  name: "AI Crawler Tracker",
  tagline: "Who crawled my site?",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  worker: {
    endpoint: process.env.NEXT_PUBLIC_CF_WORKER,
    token: process.env.NEXT_PUBLIC_CF_TOKEN
  }
};
```

### Bot Detection

Edit `src/lib/bots.ts` to customize bot detection patterns:
```typescript
export const botRegex = /(bot|spider|crawl|gpt|perplexity|...)/i;
```

## Pages

- **`/`** - Home page with features overview
- **`/crawlers`** - Interactive dashboard with crawler visit data
- **`/tutorials`** - Setup guides and documentation
- **`/robots.txt`** - Generated robots.txt
- **`/sitemap.xml`** - Generated XML sitemap

## SEO Features

- Automatic `robots.txt` generation
- Dynamic `sitemap.xml` with all routes
- JSON-LD structured data (Organization, WebSite, BreadcrumbList)
- OpenGraph meta tags
- Canonical URLs
- Google Search Console verification

## Tracked Bots

- **AI Bots**: GPTBot, Claude, Perplexity, Cohere
- **Search Engines**: Googlebot, Bingbot, DuckDuckBot, Baiduspider, YandexBot
- **Social**: Facebook, Twitter, LinkedIn bots
- **SEO**: AhrefsBot, SemrushBot, MJ12bot
- **Others**: ByteSpider, and more

## Development

### Run locally:
```bash
npm run dev
```

### Type checking:
```bash
npx tsc --noEmit
```

### Linting:
```bash
npm run lint
```

### Build:
```bash
npm run build
```

## Troubleshooting

### Build fails with bash error on Windows
Use `--ignore-scripts` flag:
```bash
npm install --ignore-scripts
```

Or run build directly:
```bash
node node_modules/next/dist/bin/next build
```

### Static export fails
Make sure dynamic routes have:
```typescript
export const dynamic = "force-static";
```

### Worker data not loading
Check:
- Worker endpoint is accessible
- CORS is enabled on Worker
- Token matches in .env.local and Worker
- KV namespace is bound correctly

## License

MIT

## Author

Steve Choi - [GitHub](https://github.com/stevechoi0222)

## Contributing

Issues and pull requests welcome!

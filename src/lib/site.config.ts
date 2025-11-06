export const siteConfig = {
  name: "AI Crawler Tracker",
  tagline: "Who crawled my site?",
  description: "Live crawler visit viewer + tutorials on bot tracking. Track GPT bots, Perplexity, and other AI crawlers accessing your website.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stevechoi0222.github.io/ai-cralwer-tracker",
  author: {
    name: "Steve Choi",
    url: "https://github.com/stevechoi0222"
  },
  links: {
    github: "https://github.com/stevechoi0222/ai-cralwer-tracker",
  },
  worker: {
    endpoint: process.env.NEXT_PUBLIC_CF_WORKER || "https://ai-logger.stevechoi0222.workers.dev",
    token: process.env.NEXT_PUBLIC_CF_TOKEN || "sandbox-2025-11-05"
  }
} as const;

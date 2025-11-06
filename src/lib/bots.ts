export const botRegex = /(bot|spider|crawl|gpt|perplexity|anthropic|claude|bytespider|bingpreview|baiduspider|duckduckbot|sogou|mj12|ahrefs|semrush|seznambot|yandex|slurp|google|facebookexternalhit|twitterbot|whatsapp|telegram|apis-google|mediapartners|adsbot|feedfetcher|storebot)/i;

export function isBot(ua?: string): boolean {
  return !!ua && botRegex.test(ua);
}

export function getBotName(ua?: string): string | null {
  if (!ua) return null;

  const lower = ua.toLowerCase();

  // AI Bots
  if (lower.includes('gptbot')) return 'GPTBot (OpenAI)';
  if (lower.includes('chatgpt')) return 'ChatGPT-User';
  if (lower.includes('claude')) return 'Claude (Anthropic)';
  if (lower.includes('anthropic')) return 'Anthropic';
  if (lower.includes('perplexity')) return 'Perplexity';
  if (lower.includes('cohere')) return 'Cohere';

  // Google Crawlers (check specific types first, then generic)
  if (lower.includes('google-extended')) return 'Google-Extended (AI Training)';
  if (lower.includes('google-inspectiontool')) return 'Google Search Console';
  if (lower.includes('googlebot-image')) return 'Googlebot-Image';
  if (lower.includes('googlebot-video')) return 'Googlebot-Video';
  if (lower.includes('googlebot-news')) return 'Googlebot-News';
  if (lower.includes('googlebot')) return 'Googlebot';
  if (lower.includes('google-site-verification')) return 'Google Site Verification';
  if (lower.includes('adsbot-google')) return 'AdsBot-Google';
  if (lower.includes('mediapartners-google')) return 'Mediapartners-Google (AdSense)';
  if (lower.includes('feedfetcher-google')) return 'FeedFetcher-Google';
  if (lower.includes('google-read-aloud')) return 'Google Read Aloud';
  if (lower.includes('storebot-google')) return 'Storebot-Google';
  if (lower.includes('apis-google')) return 'APIs-Google';
  if (lower.includes('googleother')) return 'GoogleOther';

  // Other Search Engines
  if (lower.includes('bingbot') || lower.includes('bingpreview')) return 'Bingbot';
  if (lower.includes('yandex')) return 'YandexBot';
  if (lower.includes('duckduckbot')) return 'DuckDuckBot';
  if (lower.includes('baiduspider')) return 'Baiduspider';

  // Social
  if (lower.includes('facebookexternalhit')) return 'Facebook Bot';
  if (lower.includes('twitterbot')) return 'Twitter Bot';
  if (lower.includes('linkedinbot')) return 'LinkedIn Bot';

  // SEO/Crawlers
  if (lower.includes('ahrefs')) return 'AhrefsBot';
  if (lower.includes('semrush')) return 'SemrushBot';
  if (lower.includes('mj12bot')) return 'MJ12bot';
  if (lower.includes('bytespider')) return 'ByteSpider (TikTok)';

  // Generic
  if (lower.includes('bot')) return 'Generic Bot';
  if (lower.includes('spider')) return 'Web Spider';
  if (lower.includes('crawl')) return 'Web Crawler';

  return null;
}

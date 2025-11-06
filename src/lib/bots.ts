export const botRegex = /(bot|spider|crawl|gpt|perplexity|anthropic|claude|bytespider|bingpreview|baiduspider|duckduckbot|sogou|mj12|ahrefs|semrush|seznambot|yandex|slurp|googlebot|facebookexternalhit|twitterbot|whatsapp|telegram)/i;

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

  // Search engines
  if (lower.includes('googlebot')) return 'Googlebot';
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

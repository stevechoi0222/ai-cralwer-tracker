export type CrawlerEvent = {
  ts: string;             // ISO timestamp
  ip?: string;
  colo?: string;
  asn?: number;
  asOrganization?: string;
  country?: string;
  city?: string;
  ua?: string;
  referer?: string;
  method?: string;
  path?: string;
  url?: string;
  token?: string;
  page?: string;
  headers?: Record<string, string>;
  notes?: string;
};

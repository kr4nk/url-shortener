interface DailyClick {
  date: Date;
  count: string;
}

export interface AnalyticsInfo {
  totalClicks: number;
  recentIps: string[];
  dailyClicks: DailyClick[];
}

export interface UrlEntry {
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
  alias?: string;
  analytics?: AnalyticsInfo;
  expiresAt?: string;
}

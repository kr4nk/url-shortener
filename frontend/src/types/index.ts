export interface AnalyticsInfo {
  totalClicks: number
  recentIps: string[]
}

export interface UrlEntry {
  shortUrl: string
  originalUrl: string
  createdAt: string
  clickCount: number
  analytics?: AnalyticsInfo
  expiresAt?: string | null
}

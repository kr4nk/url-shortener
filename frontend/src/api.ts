import axios from 'axios'
import type { UrlEntry, AnalyticsInfo } from './types'

const API = '/api'

export const shortenUrl = async (data: {
  originalUrl: string
  alias?: string
  expiresAt?: string
}) => axios.post(`${API}/shorten`, data)

export const getUrlInfo = async (
  shortUrl: string
): Promise<{ data: UrlEntry }> => axios.get<UrlEntry>(`${API}/info/${shortUrl}`)

export const getAnalytics = async (
  shortUrl: string
): Promise<{ data: AnalyticsInfo }> =>
  axios.get<AnalyticsInfo>(`${API}/analytics/${shortUrl}`)

export const deleteUrl = async (shortUrl: string) =>
  axios.delete(`${API}/delete/${shortUrl}`)

export async function fetchAllUrls(): Promise<{ data: UrlEntry }> {
  const res = await fetch(`${API}/all`)
  if (!res.ok) throw new Error('Failed to fetch URLs')
  return res.json()
}

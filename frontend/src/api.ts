import axios from 'axios';
import type { UrlEntry, AnalyticsInfo } from './types';
import cachedFetch from './utils/cachedFetch';

const API = '/api';

export const shortenUrl = async (data: {
  originalUrl: string;
  alias?: string;
  expiresAt?: string;
}) => axios.post(`${API}/shorten`, data);

export const getUrlInfo = async (
  shortUrl: string
): Promise<{ data: UrlEntry }> => {
  const url = `${API}/info/${shortUrl}`;
  return cachedFetch<{ data: UrlEntry }>(url, () => axios.get<UrlEntry>(url), {
    cacheTimeout: 3000,
  });
};

export const getAnalytics = async (
  shortUrl: string
): Promise<{ data: AnalyticsInfo }> => {
  const url = `${API}/analytics/${shortUrl}`;
  return cachedFetch<{ data: AnalyticsInfo }>(url, () =>
    axios.get<AnalyticsInfo>(url)
  );
};

export const deleteUrl = async (shortUrl: string) =>
  axios.delete(`${API}/delete/${shortUrl}`);

export async function fetchAllUrls(): Promise<UrlEntry[]> {
  const res = await axios.get<UrlEntry[]>(`${API}/all`);
  return res.data;
}

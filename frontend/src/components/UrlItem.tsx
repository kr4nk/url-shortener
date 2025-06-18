import { useCallback, useState } from 'preact/hooks';
import type { AnalyticsInfo, UrlEntry } from '../types';
import { getAnalytics } from '../api';

type Props = {
  url: UrlEntry;
  onDelete: (shortUrl: string) => void;
};

export default function UrlItem({ url, onDelete }: Props) {
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsInfo | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const onToggleStats = useCallback(
    async (s: string) => {
      setError('');
      if (expanded === s) {
        setExpanded(null);
        setAnalytics(null);
        return;
      }

      try {
        const { data } = await getAnalytics(s);
        setAnalytics(data);
        setExpanded(s);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load stats');
      }
    },
    [expanded]
  );

  return (
    <div class='p-4 rounded-2xl bg-zinc-50 border border-white/10'>
      <div class='flex justify-between items-center'>
        <div class='flex-1 space-y-1 min-w-0'>
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/${url.shortUrl}`}
            target='_blank'
            rel='noopener noreferrer'
            class='block text-blue-700 font-medium hover:underline truncate'
          >
            {url.shortUrl}
          </a>
          <div class='text-gray-700 text-sm truncate'>{url.originalUrl}</div>
          <div class='text-xs text-gray-800'>
            <span>
              Created: {new Date(url.createdAt).toLocaleString()} • Clicks:{' '}
              {url.clickCount}
            </span>
            <br />
            {url.expiresAt && (
              <span class='text-red-700'>
                Expires: {new Date(url.expiresAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <span class='pr-4 text-sm text-red-700'>{error}</span>
        <div class='flex-shrink-0 flex space-x-2'>
          <button
            onClick={() => onDelete(url.shortUrl)}
            class='px-3 py-1 text-red-500 border border-red-300 rounded hover:bg-red-300 text-sm'
          >
            Delete
          </button>
          <button
            onClick={() => onToggleStats(url.shortUrl)}
            class='px-3 py-1 text-blue-500 border border-blue-300 rounded hover:bg-blue-300 text-sm'
          >
            {expanded === url.shortUrl ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </div>
      {expanded === url.shortUrl && analytics && (
        <div class='mt-3 p-3 rounded-lg space-y-2'>
          <div>
            <strong>Total Clicks:</strong> {analytics.totalClicks}
          </div>
          <div>
            <strong>Recent IPs:</strong> {analytics.recentIps.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

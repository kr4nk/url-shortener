import { useEffect, useState, useCallback } from 'preact/hooks';
import { shortenUrl, deleteUrl, getUrlInfo, fetchAllUrls } from './api';
import type { UrlEntry } from './types';
import UrlForm from './components/UrlForm';
import UrlList from './components/UrlList';

export default function App() {
  const [urls, setUrls] = useState<UrlEntry[]>([]); //redo
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successShort, setSuccessShort] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllUrls()
      .then((data) => {
        setUrls(
          data.sort(
            (a: UrlEntry, b: UrlEntry) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function doShorten(data: UrlEntry) {
    try {
      const cleanData = {
        ...data,
        alias: data.alias?.trim() === '' ? undefined : data.alias,
      };
      const res = await shortenUrl(cleanData);
      const info = await getUrlInfo(res.data.shortUrl);

      const newEntry: UrlEntry = {
        shortUrl: res.data.shortUrl,
        originalUrl: info.data.originalUrl,
        createdAt: info.data.createdAt,
        clickCount: info.data.clickCount,
        expiresAt: info.data.expiresAt,
        analytics: info.data.analytics,
      };

      setUrls((prev) => [newEntry, ...prev]);
      setSuccessShort(res.data.shortUrl);
      setTimeout(() => setSuccessShort(null), 2000);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error shortening URL');
    } finally {
      setLoading(false);
    }
  }

  const onDelete = useCallback(async (s: string) => {
    try {
      await deleteUrl(s);
      setUrls((prev) => prev.filter((u) => u.shortUrl !== s));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Delete failed');
    }
  }, []);

  return (
    <div
      class='text-gray-800 py-12 px-4 rounded-2xl shadow-sm border border-solid border-white'
      style={
        'background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px);'
      }
    >
      <div class='space-y-8'>
        <h1 class='text-center text-4xl font-bold tracking-tight text-shadow-[1px_1px_1px_rgba(255_255_255/_1)]'>
          URL Shortener
        </h1>
        <UrlForm
          onSubmit={doShorten}
          loading={loading}
          error={error}
          successShort={successShort}
        />
        {error && <div class='text-red-400 text-sm'>{error}</div>}
        {loading && <div class='text-center text-gray-400'>Loading...</div>}
        <UrlList urls={urls} onDelete={onDelete} />
      </div>
    </div>
  );
}

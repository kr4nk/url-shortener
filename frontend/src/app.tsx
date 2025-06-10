import { useEffect, useState, useCallback } from 'preact/hooks'
import {
  shortenUrl,
  getAnalytics,
  deleteUrl,
  getUrlInfo,
  fetchAllUrls,
} from './api'
import type { UrlEntry } from './types'

export default function App() {
  const [form, setForm] = useState({
    originalUrl: '',
    alias: '',
    expiresAt: '',
  })
  const [urls, setUrls] = useState<UrlEntry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchAllUrls()
      .then((data) => setUrls(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const path = window.location.pathname.slice(1)
    const isApiRoute = path.startsWith('api') || path === ''
    if (!isApiRoute) {
      window.location.href = `http://localhost:3000/${path}`
    }
  }, [])

  const handleShorten = useCallback(async () => {
    setLoading(true)
    try {
      const res = await shortenUrl(form)
      const code = res.data.shortUrl.split('/').pop()

      const info = await getUrlInfo(code)
      const enrichedInfo: UrlEntry = {
        shortUrl: res.data.shortUrl,
        originalUrl: info.data.originalUrl,
        createdAt: info.data.createdAt,
        clickCount: info.data.clickCount,
        expiresAt: info.data.expiresAt,
        analytics: info.data.analytics || undefined,
      }

      setUrls((prev) => [...prev, enrichedInfo])
      setForm({ originalUrl: '', alias: '', expiresAt: '' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error shortening URL')
    } finally {
      setLoading(false)
    }
  }, [form])

  const handleDelete = useCallback(async (shortUrl: string) => {
    setError('')
    try {
      await deleteUrl(shortUrl)
      setUrls((prev) => prev.filter((u) => u.shortUrl !== shortUrl))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting URL')
    }
  }, [])

  const handleAnalytics = useCallback(async (shortUrl: string) => {
    setError('')
    try {
      const res = await getAnalytics(shortUrl)
      setUrls((prev) =>
        prev.map((entry) =>
          entry.shortUrl === shortUrl
            ? ({ ...entry, analytics: res.data } as UrlEntry)
            : entry
        )
      )
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading analytics')
    }
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>URL Shortener</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder='Original URL'
          value={form.originalUrl}
          onInput={(e) =>
            setForm({ ...form, originalUrl: e.currentTarget.value })
          }
          style={{ marginRight: 8 }}
          disabled={loading}
        />
        <input
          placeholder='Alias (optional)'
          value={form.alias}
          onInput={(e) => setForm({ ...form, alias: e.currentTarget.value })}
          style={{ marginRight: 8 }}
          disabled={loading}
        />
        <input
          type='date'
          value={form.expiresAt}
          onInput={(e) =>
            setForm({ ...form, expiresAt: e.currentTarget.value })
          }
          style={{ marginRight: 8 }}
          disabled={loading}
        />
        <button onClick={handleShorten} disabled={loading}>
          Shorten
        </button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <table cellPadding='8' style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Created At</th>
            <th>Clicks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr key={url.shortUrl}>
              <td>
                <a
                  href={url.shortUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {url.shortUrl}
                </a>
              </td>
              <td>{url.originalUrl}</td>
              <td>{new Date(url.createdAt).toLocaleString()}</td>
              <td>{url.clickCount}</td>
              <td>
                <button
                  onClick={() => handleDelete(url.shortUrl)}
                  disabled={loading}
                  style={{ marginRight: 8 }}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleAnalytics(url.shortUrl)}
                  disabled={loading}
                >
                  Show Stats
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {urls.map(
        (url) =>
          url.analytics && (
            <div key={`${url.shortUrl}-analytics`} style={{ marginTop: 8 }}>
              <strong>Analytics for {url.shortUrl}:</strong>
              <div>Clicks: {url.analytics.totalClicks}</div>
              <div>Last IPs: {url.analytics.recentIps.join(', ')}</div>
            </div>
          )
      )}
    </div>
  )
}

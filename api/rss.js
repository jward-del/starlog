// api/rss.js — Vercel serverless function
// Proxies RSS feeds to avoid CORS issues in the browser

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=15`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

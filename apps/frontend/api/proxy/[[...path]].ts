export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://yapi.ap-siliconflow.cn';

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  // Extract the path after /api/proxy/
  const path = req.url?.replace(/^\/api\/proxy/, '') || '';
  const targetUrl = `${BACKEND_URL}${path}`;

  // Build headers to forward
  const headers = {};
  ['content-type', 'authorization', 'accept', 'x-request-id'].forEach(h => {
    if (req.headers[h]) headers[h] = req.headers[h];
  });

  const fetchOptions = { method: req.method, headers };

  // Forward body for non-GET/HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Forward the response
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(502).json({
      error: 'Backend proxy error',
      message: error?.message || 'Unknown error',
      targetUrl,
    });
  }
}

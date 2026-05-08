import type { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = process.env.BACKEND_URL || 'https://yapi.ap-siliconflow.cn';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  // e.g., /api/proxy/auth/register -> /auth/register
  const path = req.url?.replace(/^\/api\/proxy/, '') || '';
  const targetUrl = `${BACKEND_URL}${path}`;

  // Build headers to forward
  const headers: Record<string, string> = {};
  const forwardHeaders = ['content-type', 'authorization', 'accept', 'x-request-id'];
  for (const h of forwardHeaders) {
    if (req.headers[h]) {
      headers[h] = req.headers[h] as string;
    }
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  // Forward body for non-GET/HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body !== undefined) {
    fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    // Set CORS headers on response
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
  } catch (error: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(502).json({
      error: 'Backend proxy error',
      message: error?.message || 'Unknown error',
      targetUrl,
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Melody Magic Backend is running on Vercel!',
    environment: process.env.NODE_ENV || 'development'
  });
}

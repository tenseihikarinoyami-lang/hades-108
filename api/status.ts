import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.status(200).json({
    body: '¡Bienvenido al Protocolo del Inframundo!',
    query: request.query,
    cookies: request.cookies,
    timestamp: new Date().toISOString(),
    status: 'Operational',
    region: process.env.VERCEL_REGION || 'unknown'
  });
}

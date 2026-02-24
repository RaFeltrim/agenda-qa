/**
 * api/gemini-proxy.ts — Vercel Serverless Function
 * V3 P0 Security Fix: Secure proxy for Gemini API
 * The API key lives server-side only. Never in the browser bundle.
 *
 * Client usage:
 *   POST /api/gemini-proxy
 *   Headers: { Authorization: "Bearer <supabase_access_token>" }
 *   Body: { prompt: string, model?: string, maxTokens?: number }
 *
 * Required Vercel env vars (server-side, NO VITE_ prefix):
 *   GEMINI_API_KEY — from Google AI Studio
 *
 * After wiring this up, remove VITE_GEMINI_API_KEY from Vercel env.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(id: string): boolean {
    const now = Date.now();
    const entry = rateMap.get(id);
    if (!entry || now > entry.resetAt) {
          rateMap.set(id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
          return false;
    }
    if (entry.count >= RATE_LIMIT_MAX) return true;
    entry.count++;
    return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          return res.status(204).end();
    }

  if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
  }

  const allowed = ['https://agenda-qa.vercel.app', 'http://localhost:3001'];
    const origin = req.headers.origin || '';
    if (!allowed.includes(origin)) {
          return res.status(403).json({ error: 'Forbidden' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);

  // Auth: extract user id from Supabase JWT (sub claim)
  const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = auth.slice(7);
    let userId = 'anon';
    try {
          const payload = JSON.parse(
                  Buffer.from(token.split('.')[1], 'base64url').toString('utf8')
                );
          userId = payload.sub ?? 'anon';
    } catch {
          return res.status(401).json({ error: 'Invalid token' });
    }

  if (isRateLimited(userId)) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { prompt, model = 'gemini-2.0-flash', maxTokens = 1024 } = req.body ?? {};
    if (!prompt || typeof prompt !== 'string' || prompt.length > 8000) {
          return res.status(400).json({ error: 'Invalid prompt' });
    }

  const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
          return res.status(503).json({ error: 'AI service not configured' });
    }

  const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
            }),
    }
      );

  if (!upstream.ok) {
        return res.status(502).json({ error: 'Upstream AI error' });
  }

  const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return res.status(200).json({ text, model });
}

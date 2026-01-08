import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { polymarket } from '../routes/polymarket.js';
import { polymarketClient } from '../lib/polymarket-client.js';

// Mock the polymarket client for app-level tests
vi.mock('../lib/polymarket-client.js', () => ({
  polymarketClient: {
    getMarkets: vi.fn(),
    getMarket: vi.fn(),
    searchMarkets: vi.fn(),
    getEvents: vi.fn(),
    getEvent: vi.fn(),
  },
}));

describe('Application', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();

    // Apply middleware
    app.use("*", logger());
    app.use(
      "*",
      cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );

    // Health endpoint
    app.get("/health", (c) => c.json({ status: "ok" }));

    // API routes
    app.route("/api", polymarket);

    // 404 handler
    app.notFound((c) => c.json({ error: "Not found" }, 404));

    // Error handler
    app.onError((err, c) => {
      console.error("Server error:", err);
      return c.json({ error: "Internal server error" }, 500);
    });

    vi.clearAllMocks();
  });

  describe('Health Endpoint', () => {
    it('should return 200 with status ok', async () => {
      const res = await app.request('/health');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json).toEqual({ status: 'ok' });
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await app.request('/unknown/route');
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json).toEqual({ error: 'Not found' });
    });

    it('should return 404 for unknown API routes', async () => {
      const res = await app.request('/api/unknown');
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json).toEqual({ error: 'Not found' });
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers for allowed origins', async () => {
      vi.mocked(polymarketClient.getMarkets).mockResolvedValueOnce([]);

      const res = await app.request('/api/markets', {
        headers: {
          Origin: 'http://localhost:5173',
        },
      });

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
    });

    it('should handle OPTIONS preflight request', async () => {
      const res = await app.request('/api/markets', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(res.status).toBeLessThanOrEqual(204);
    });
  });

  describe('API Integration', () => {
    it('should route /api/markets correctly', async () => {
      const mockMarkets = [{ id: '1', question: 'Test?' }];
      vi.mocked(polymarketClient.getMarkets).mockResolvedValueOnce(mockMarkets as any);

      const res = await app.request('/api/markets');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockMarkets);
    });

    it('should route /api/markets/:id correctly', async () => {
      const mockMarket = { id: 'abc', question: 'Test?' };
      vi.mocked(polymarketClient.getMarket).mockResolvedValueOnce(mockMarket as any);

      const res = await app.request('/api/markets/abc');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockMarket);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { polymarket } from '../polymarket.js';
import { polymarketClient, GammaMarket } from '../../lib/polymarket-client.js';

// Mock the polymarket client
vi.mock('../../lib/polymarket-client.js', () => ({
  polymarketClient: {
    getMarkets: vi.fn(),
    getMarket: vi.fn(),
    searchMarkets: vi.fn(),
    getEvents: vi.fn(),
    getEvent: vi.fn(),
  },
}));

const mockMarket: GammaMarket = {
  id: '123',
  question: 'Test question?',
  conditionId: 'cond-123',
  slug: 'test-market',
  resolutionSource: 'https://source.com',
  endDate: '2024-12-31',
  liquidity: '100000',
  startDate: '2024-01-01',
  image: '',
  icon: '',
  description: 'Test',
  outcomes: '["Yes","No"]',
  outcomePrices: '["0.6","0.4"]',
  volume: '500000',
  active: true,
  closed: false,
  marketMakerAddress: '0x123',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  new: false,
  featured: false,
  submitted_by: 'test',
  category: 'test',
  volume24hr: '10000',
};

describe('polymarket routes', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api', polymarket);
    vi.clearAllMocks();
  });

  describe('GET /api/markets', () => {
    it('should return markets successfully', async () => {
      const mockMarkets = [mockMarket];
      vi.mocked(polymarketClient.getMarkets).mockResolvedValueOnce(mockMarkets);

      const res = await app.request('/api/markets');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockMarkets);
    });

    it('should pass query parameters to client', async () => {
      vi.mocked(polymarketClient.getMarkets).mockResolvedValueOnce([]);

      await app.request('/api/markets?limit=10&active=true&offset=5');

      expect(polymarketClient.getMarkets).toHaveBeenCalledWith({
        limit: '10',
        offset: '5',
        active: 'true',
        closed: undefined,
        order: undefined,
        ascending: undefined,
      });
    });

    it('should return 500 on client error', async () => {
      vi.mocked(polymarketClient.getMarkets).mockRejectedValueOnce(
        new Error('API failure')
      );

      const res = await app.request('/api/markets');

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Failed to fetch markets');
    });
  });

  describe('GET /api/markets/search', () => {
    it('should return 400 if query parameter is missing', async () => {
      const res = await app.request('/api/markets/search');

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("'q' is required");
    });

    it('should search markets with query', async () => {
      const mockResults = [mockMarket];
      vi.mocked(polymarketClient.searchMarkets).mockResolvedValueOnce(mockResults);

      const res = await app.request('/api/markets/search?q=election');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockResults);
      expect(polymarketClient.searchMarkets).toHaveBeenCalledWith('election');
    });

    it('should return 500 on search error', async () => {
      vi.mocked(polymarketClient.searchMarkets).mockRejectedValueOnce(
        new Error('Search failed')
      );

      const res = await app.request('/api/markets/search?q=test');

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Failed to search markets');
    });
  });

  describe('GET /api/markets/:id', () => {
    it('should return a single market', async () => {
      vi.mocked(polymarketClient.getMarket).mockResolvedValueOnce(mockMarket);

      const res = await app.request('/api/markets/123');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockMarket);
      expect(polymarketClient.getMarket).toHaveBeenCalledWith('123');
    });

    it('should return 500 on fetch error', async () => {
      vi.mocked(polymarketClient.getMarket).mockRejectedValueOnce(
        new Error('Not found')
      );

      const res = await app.request('/api/markets/nonexistent');

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Failed to fetch market');
    });
  });

  describe('GET /api/events', () => {
    it('should return events successfully', async () => {
      const mockEvents = [{ id: 'evt-1', title: 'Event', markets: [] }];
      vi.mocked(polymarketClient.getEvents).mockResolvedValueOnce(mockEvents as any);

      const res = await app.request('/api/events');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockEvents);
    });

    it('should pass query parameters', async () => {
      vi.mocked(polymarketClient.getEvents).mockResolvedValueOnce([]);

      await app.request('/api/events?limit=5&active=true');

      expect(polymarketClient.getEvents).toHaveBeenCalledWith({
        limit: '5',
        offset: undefined,
        active: 'true',
        closed: undefined,
        order: undefined,
        ascending: undefined,
      });
    });

    it('should return 500 on error', async () => {
      vi.mocked(polymarketClient.getEvents).mockRejectedValueOnce(
        new Error('Failed')
      );

      const res = await app.request('/api/events');

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Failed to fetch events');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a single event', async () => {
      const mockEvent = { id: 'evt-123', title: 'Single Event', markets: [] };
      vi.mocked(polymarketClient.getEvent).mockResolvedValueOnce(mockEvent as any);

      const res = await app.request('/api/events/evt-123');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockEvent);
      expect(polymarketClient.getEvent).toHaveBeenCalledWith('evt-123');
    });

    it('should return 500 on error', async () => {
      vi.mocked(polymarketClient.getEvent).mockRejectedValueOnce(
        new Error('Not found')
      );

      const res = await app.request('/api/events/nonexistent');

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('Failed to fetch event');
    });
  });
});

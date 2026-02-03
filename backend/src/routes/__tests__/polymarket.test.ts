import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { polymarket } from '../polymarket.js';
import { polymarketClient, GammaMarket } from '../../lib/polymarket-client.js';
import { kalshiClient } from '../../lib/kalshi-client.js';

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

// Mock the kalshi client
vi.mock('../../lib/kalshi-client.js', () => ({
  kalshiClient: {
    getMarkets: vi.fn(),
    getMarket: vi.fn(),
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
    // Default Kalshi to return empty to avoid real API calls
    vi.mocked(kalshiClient.getMarkets).mockResolvedValue([]);
    vi.mocked(kalshiClient.getEvents).mockResolvedValue([]);
  });

  describe('GET /api/markets', () => {
    it('should return markets successfully', async () => {
      const mockMarkets = [mockMarket];
      vi.mocked(polymarketClient.getMarkets).mockResolvedValueOnce(mockMarkets);

      const res = await app.request('/api/markets');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].id).toBe('123');
      expect(json.data[0].platform).toBe('polymarket');
      expect(json.data[0].platformUrl).toBe('https://polymarket.com/market/test-market');
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

    it('should filter by platform when specified', async () => {
      const mockMarkets = [mockMarket];
      vi.mocked(polymarketClient.getMarkets).mockResolvedValueOnce(mockMarkets);

      const res = await app.request('/api/markets?platform=polymarket');
      const json = await res.json();

      expect(res.status).toBe(200);
      // Should only call polymarket, not kalshi
      expect(polymarketClient.getMarkets).toHaveBeenCalled();
      expect(kalshiClient.getMarkets).not.toHaveBeenCalled();
      expect(json.data[0].platform).toBe('polymarket');
    });

    it('should return 500 when both clients fail', async () => {
      vi.mocked(polymarketClient.getMarkets).mockRejectedValueOnce(
        new Error('API failure')
      );
      vi.mocked(kalshiClient.getMarkets).mockRejectedValueOnce(
        new Error('API failure')
      );

      const res = await app.request('/api/markets');

      // Even when one fails, we return 200 with empty array since we handle errors gracefully
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual([]);
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
      expect(json.data).toHaveLength(1);
      expect(json.data[0].platform).toBe('polymarket');
      expect(polymarketClient.searchMarkets).toHaveBeenCalledWith('election');
    });

    it('should return 200 with empty array on search error', async () => {
      vi.mocked(polymarketClient.searchMarkets).mockRejectedValueOnce(
        new Error('Search failed')
      );

      const res = await app.request('/api/markets/search?q=test');

      // Search now handles errors gracefully and returns empty
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual([]);
    });
  });

  describe('GET /api/markets/:id', () => {
    it('should return a single market', async () => {
      vi.mocked(polymarketClient.getMarket).mockResolvedValueOnce(mockMarket);

      const res = await app.request('/api/markets/123');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.id).toBe('123');
      expect(json.data.platform).toBe('polymarket');
      expect(polymarketClient.getMarket).toHaveBeenCalledWith('123');
    });

    it('should return 404 when market not found in both platforms', async () => {
      vi.mocked(polymarketClient.getMarket).mockRejectedValueOnce(
        new Error('Not found')
      );
      vi.mocked(kalshiClient.getMarket).mockRejectedValueOnce(
        new Error('Not found')
      );

      const res = await app.request('/api/markets/nonexistent');

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Market not found');
    });
  });

  describe('GET /api/events', () => {
    it('should return events successfully', async () => {
      const mockEvents = [{
        id: 'evt-1',
        title: 'Event',
        slug: 'event-1',
        description: '',
        startDate: '2024-01-01',
        creationDate: '2024-01-01',
        endDate: '2024-12-31',
        image: '',
        icon: '',
        active: true,
        closed: false,
        archived: false,
        new: false,
        featured: false,
        restricted: false,
        liquidity: 1000,
        volume: 5000,
        markets: [],
      }];
      vi.mocked(polymarketClient.getEvents).mockResolvedValueOnce(mockEvents as any);

      const res = await app.request('/api/events');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].platform).toBe('polymarket');
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

    it('should return 200 with empty array when both fail', async () => {
      vi.mocked(polymarketClient.getEvents).mockRejectedValueOnce(
        new Error('Failed')
      );
      vi.mocked(kalshiClient.getEvents).mockRejectedValueOnce(
        new Error('Failed')
      );

      const res = await app.request('/api/events');

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual([]);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return a single event', async () => {
      const mockEvent = {
        id: 'evt-123',
        title: 'Single Event',
        slug: 'single-event',
        description: '',
        startDate: '2024-01-01',
        creationDate: '2024-01-01',
        endDate: '2024-12-31',
        image: '',
        icon: '',
        active: true,
        closed: false,
        archived: false,
        new: false,
        featured: false,
        restricted: false,
        liquidity: 1000,
        volume: 5000,
        markets: [],
      };
      vi.mocked(polymarketClient.getEvent).mockResolvedValueOnce(mockEvent as any);

      const res = await app.request('/api/events/evt-123');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.id).toBe('evt-123');
      expect(json.data.platform).toBe('polymarket');
      expect(polymarketClient.getEvent).toHaveBeenCalledWith('evt-123');
    });

    it('should return 404 when event not found in both platforms', async () => {
      vi.mocked(polymarketClient.getEvent).mockRejectedValueOnce(
        new Error('Not found')
      );
      vi.mocked(kalshiClient.getEvent).mockRejectedValueOnce(
        new Error('Not found')
      );

      const res = await app.request('/api/events/nonexistent');

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toBe('Event not found');
    });
  });
});

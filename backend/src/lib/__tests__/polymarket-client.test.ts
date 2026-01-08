import { describe, it, expect, vi, beforeEach } from 'vitest';
import { polymarketClient, GammaMarket } from '../polymarket-client.js';

// Mock the global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createMockMarket = (overrides: Partial<GammaMarket> = {}): GammaMarket => ({
  id: 'test-123',
  question: 'Will it rain tomorrow?',
  conditionId: 'cond-123',
  slug: 'rain-tomorrow',
  resolutionSource: 'https://weather.com',
  endDate: '2024-12-31T23:59:59Z',
  liquidity: '100000',
  startDate: '2024-01-01T00:00:00Z',
  image: 'https://example.com/image.png',
  icon: 'https://example.com/icon.png',
  description: 'Test market',
  outcomes: '["Yes","No"]',
  outcomePrices: '["0.65","0.35"]',
  volume: '500000',
  active: true,
  closed: false,
  marketMakerAddress: '0xabc',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  new: false,
  featured: false,
  submitted_by: 'test',
  category: 'test',
  volume24hr: '10000',
  ...overrides,
});

describe('polymarketClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getMarkets', () => {
    it('should fetch markets with default parameters', async () => {
      const mockMarkets = [createMockMarket()];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMarkets),
      });

      const result = await polymarketClient.getMarkets();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gamma-api.polymarket.com/markets',
        expect.objectContaining({
          headers: { Accept: 'application/json' },
        })
      );
      expect(result).toEqual(mockMarkets);
    });

    it('should pass query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await polymarketClient.getMarkets({ limit: '10', active: 'true', offset: '5' });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('active=true');
      expect(calledUrl).toContain('offset=5');
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(polymarketClient.getMarkets()).rejects.toThrow(
        'Gamma API error: 500 Internal Server Error'
      );
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(polymarketClient.getMarkets()).rejects.toThrow('Network error');
    });
  });

  describe('getMarket', () => {
    it('should fetch a single market by ID', async () => {
      const mockMarket = createMockMarket({ id: '456' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMarket),
      });

      const result = await polymarketClient.getMarket('456');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gamma-api.polymarket.com/markets/456',
        expect.any(Object)
      );
      expect(result).toEqual(mockMarket);
    });

    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(polymarketClient.getMarket('nonexistent')).rejects.toThrow(
        'Gamma API error: 404 Not Found'
      );
    });
  });

  describe('getMarketBySlug', () => {
    it('should fetch market by slug', async () => {
      const mockMarket = createMockMarket({ slug: 'test-slug' });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockMarket]),
      });

      const result = await polymarketClient.getMarketBySlug('test-slug');

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('slug=test-slug');
      expect(result).toEqual(mockMarket);
    });

    it('should throw error when market not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await expect(polymarketClient.getMarketBySlug('nonexistent')).rejects.toThrow(
        'Market not found: nonexistent'
      );
    });
  });

  describe('searchMarkets', () => {
    it('should search markets with query parameter', async () => {
      const mockMarkets = [createMockMarket({ question: 'Election result' })];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMarkets),
      });

      const result = await polymarketClient.searchMarkets('election');

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('_q=election');
      expect(calledUrl).toContain('active=true');
      expect(result).toEqual(mockMarkets);
    });

    it('should handle empty search results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await polymarketClient.searchMarkets('xyz123');

      expect(result).toEqual([]);
    });
  });

  describe('getEvents', () => {
    it('should fetch events with parameters', async () => {
      const mockEvents = [{ id: 'evt-1', title: 'Test Event', markets: [] }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      });

      const result = await polymarketClient.getEvents({ limit: '5', active: 'true' });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('/events');
      expect(calledUrl).toContain('limit=5');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEvent', () => {
    it('should fetch a single event by ID', async () => {
      const mockEvent = { id: 'evt-123', title: 'Single Event', markets: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvent),
      });

      const result = await polymarketClient.getEvent('evt-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gamma-api.polymarket.com/events/evt-123',
        expect.any(Object)
      );
      expect(result).toEqual(mockEvent);
    });
  });
});

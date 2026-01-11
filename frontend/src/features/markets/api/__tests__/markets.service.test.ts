import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { MarketsService } from '../markets.service';
import { server } from '@/test/mocks/server';
import { mockMarket, mockMalformedMarket, mockExpiredMarket } from '@/test/mocks/data/markets';

describe('MarketsService', () => {
  describe('getMarkets', () => {
    it('should fetch and parse markets', async () => {
      const markets = await MarketsService.getMarkets({ limit: 10 });

      expect(Array.isArray(markets)).toBe(true);
      expect(markets.length).toBeGreaterThan(0);

      // Verify parsing occurred
      const market = markets[0];
      expect(market).toHaveProperty('parsedOutcomes');
      expect(Array.isArray(market.parsedOutcomes)).toBe(true);
    });

    it('should correctly parse outcomes and prices', async () => {
      const markets = await MarketsService.getMarkets();
      const market = markets[0];

      expect(market.parsedOutcomes).toEqual([
        { name: 'Yes', price: 0.65 },
        { name: 'No', price: 0.35 },
      ]);
    });

    it('should pass parameters correctly', async () => {
      const markets = await MarketsService.getMarkets({
        limit: 5,
        offset: 10,
        active: true,
      });

      // If limit works, we should get at most 5
      expect(markets.length).toBeLessThanOrEqual(5);
    });

    it('should handle malformed outcomes gracefully', async () => {
      server.use(
        http.get('/api/markets', () => {
          return HttpResponse.json({
            data: [mockMalformedMarket],
          });
        })
      );

      const markets = await MarketsService.getMarkets();
      expect(markets[0].parsedOutcomes).toEqual([]);
    });

    it('should handle empty outcomes', async () => {
      server.use(
        http.get('/api/markets', () => {
          return HttpResponse.json({
            data: [{
              ...mockMarket,
              outcomes: '',
              outcomePrices: '',
            }],
          });
        })
      );

      const markets = await MarketsService.getMarkets();
      expect(markets[0].parsedOutcomes).toEqual([]);
    });

    it('should handle API errors', async () => {
      server.use(
        http.get('/api/markets', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(MarketsService.getMarkets()).rejects.toThrow();
    });

    it('should filter out markets with past endDate', async () => {
      server.use(
        http.get('/api/markets', () => {
          return HttpResponse.json({
            data: [mockMarket, mockExpiredMarket],
          });
        })
      );

      const markets = await MarketsService.getMarkets();

      // Should only include future markets
      expect(markets.length).toBe(1);
      expect(markets[0].id).toBe(mockMarket.id);

      // Should not include expired market
      const expiredMarket = markets.find(m => m.id === mockExpiredMarket.id);
      expect(expiredMarket).toBeUndefined();
    });

    it('should pass closed parameter to API', async () => {
      let capturedClosed: string | null = null;

      server.use(
        http.get('/api/markets', ({ request }) => {
          const url = new URL(request.url);
          capturedClosed = url.searchParams.get('closed');
          return HttpResponse.json({ data: [] });
        })
      );

      await MarketsService.getMarkets({ closed: false });

      expect(capturedClosed).toBe('false');
    });
  });

  describe('getMarket', () => {
    it('should fetch a single market by ID', async () => {
      const market = await MarketsService.getMarket('test-123');

      expect(market.id).toBe('test-123');
      expect(market).toHaveProperty('parsedOutcomes');
    });

    it('should parse the single market outcomes', async () => {
      const market = await MarketsService.getMarket('test-id');

      expect(market.parsedOutcomes).toEqual([
        { name: 'Yes', price: 0.65 },
        { name: 'No', price: 0.35 },
      ]);
    });

    it('should handle 404 errors', async () => {
      server.use(
        http.get('/api/markets/:id', () => {
          return HttpResponse.json(
            { error: 'Not found' },
            { status: 404 }
          );
        })
      );

      await expect(MarketsService.getMarket('nonexistent')).rejects.toThrow();
    });
  });

  describe('searchMarkets', () => {
    it('should search markets', async () => {
      const results = await MarketsService.searchMarkets('bitcoin');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should parse search results', async () => {
      const results = await MarketsService.searchMarkets('test');

      if (results.length > 0) {
        expect(results[0]).toHaveProperty('parsedOutcomes');
        expect(Array.isArray(results[0].parsedOutcomes)).toBe(true);
      }
    });

    it('should handle empty search results', async () => {
      server.use(
        http.get('/api/markets/search', () => {
          return HttpResponse.json({ data: [] });
        })
      );

      const results = await MarketsService.searchMarkets('xyznonexistent');
      expect(results).toEqual([]);
    });

    it('should handle search errors', async () => {
      server.use(
        http.get('/api/markets/search', () => {
          return HttpResponse.json(
            { error: 'Query required' },
            { status: 400 }
          );
        })
      );

      await expect(MarketsService.searchMarkets('')).rejects.toThrow();
    });
  });
});

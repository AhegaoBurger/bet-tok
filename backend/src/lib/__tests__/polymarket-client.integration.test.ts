import { describe, it, expect } from 'vitest';
import { polymarketClient } from '../polymarket-client.js';

// These tests hit the real Gamma API
// Run with: npm run test:integration
describe('polymarketClient (Integration)', () => {
  describe('getMarkets', () => {
    it('should fetch real markets from Gamma API', async () => {
      const markets = await polymarketClient.getMarkets({ limit: '5' });

      expect(Array.isArray(markets)).toBe(true);
      expect(markets.length).toBeLessThanOrEqual(5);

      if (markets.length > 0) {
        const market = markets[0];
        expect(market).toHaveProperty('id');
        expect(market).toHaveProperty('question');
        expect(market).toHaveProperty('outcomes');
        expect(market).toHaveProperty('outcomePrices');
        expect(typeof market.id).toBe('string');
        expect(typeof market.question).toBe('string');
      }
    });

    it('should filter by active status', async () => {
      const activeMarkets = await polymarketClient.getMarkets({
        limit: '5',
        active: 'true',
      });

      expect(Array.isArray(activeMarkets)).toBe(true);
      activeMarkets.forEach((market) => {
        expect(market.active).toBe(true);
      });
    });

    it('should respect limit parameter', async () => {
      const markets = await polymarketClient.getMarkets({ limit: '3' });
      expect(markets.length).toBeLessThanOrEqual(3);
    });
  });

  describe('searchMarkets', () => {
    it('should search markets by query', async () => {
      // Use a broad search term that's likely to return results
      const results = await polymarketClient.searchMarkets('president');

      expect(Array.isArray(results)).toBe(true);
      // Search might return empty if no matches, but should not error
    });

    it('should return only active markets when searching', async () => {
      const results = await polymarketClient.searchMarkets('election');

      results.forEach((market) => {
        expect(market.active).toBe(true);
      });
    });
  });

  describe('getEvents', () => {
    it('should fetch events from Gamma API', async () => {
      const events = await polymarketClient.getEvents({ limit: '3' });

      expect(Array.isArray(events)).toBe(true);

      if (events.length > 0) {
        const event = events[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
      }
    });
  });

  describe('API Health Check', () => {
    it('should successfully connect to Gamma API', async () => {
      // This test verifies the API is reachable
      // Useful for diagnosing deployment vs code issues
      await expect(
        polymarketClient.getMarkets({ limit: '1' })
      ).resolves.toBeDefined();
    });
  });

  describe('API Response Schema Validation', () => {
    it('should return markets with expected schema', async () => {
      const markets = await polymarketClient.getMarkets({ limit: '1' });

      if (markets.length > 0) {
        const market = markets[0];

        // Required string fields
        expect(typeof market.id).toBe('string');
        expect(typeof market.question).toBe('string');
        expect(typeof market.outcomes).toBe('string');
        expect(typeof market.outcomePrices).toBe('string');

        // Boolean fields
        expect(typeof market.active).toBe('boolean');
        expect(typeof market.closed).toBe('boolean');

        // Outcomes should be valid JSON
        expect(() => JSON.parse(market.outcomes)).not.toThrow();
        expect(() => JSON.parse(market.outcomePrices)).not.toThrow();
      }
    });
  });
});

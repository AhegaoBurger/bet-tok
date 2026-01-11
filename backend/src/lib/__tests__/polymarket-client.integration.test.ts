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

    it('should filter by closed status', async () => {
      const openMarkets = await polymarketClient.getMarkets({
        limit: '5',
        closed: 'false',
      });

      expect(Array.isArray(openMarkets)).toBe(true);
      openMarkets.forEach((market) => {
        expect(market.closed).toBe(false);
      });
    });

    it('should return markets that may include past endDates (Gamma API limitation)', async () => {
      // NOTE: This test documents that Gamma API's active/closed filters are unreliable.
      // Markets with past endDates can still be returned even with active=true, closed=false.
      // This is why we apply client-side endDate filtering in the frontend service layer.
      const markets = await polymarketClient.getMarkets({
        limit: '10',
        active: 'true',
        closed: 'false',
      });

      const now = new Date();
      const pastEndDateMarkets = markets.filter((market) => {
        if (market.endDate && market.endDate !== '') {
          return new Date(market.endDate) < now;
        }
        return false;
      });

      // Document that past endDate markets may exist (Gamma API limitation)
      // Our frontend service layer filters these out
      if (pastEndDateMarkets.length > 0) {
        console.log(`Found ${pastEndDateMarkets.length} markets with past endDates (expected Gamma API behavior)`);
      }

      // Test passes regardless - we're just verifying the API call works
      expect(Array.isArray(markets)).toBe(true);
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

    it('should filter events by closed status', async () => {
      const openEvents = await polymarketClient.getEvents({
        limit: '5',
        closed: 'false',
      });

      expect(Array.isArray(openEvents)).toBe(true);
      openEvents.forEach((event) => {
        expect(event.closed).toBe(false);
      });
    });

    it('should return events that may include past endDates (Gamma API limitation)', async () => {
      // NOTE: This test documents that Gamma API's active/closed filters are unreliable.
      // Events with past endDates can still be returned even with active=true, closed=false.
      // This is why we apply client-side endDate filtering in the frontend service layer.
      const events = await polymarketClient.getEvents({
        limit: '10',
        active: 'true',
        closed: 'false',
      });

      const now = new Date();
      const pastEndDateEvents = events.filter((event) => {
        if (event.endDate && event.endDate !== '') {
          return new Date(event.endDate) < now;
        }
        return false;
      });

      // Document that past endDate events may exist (Gamma API limitation)
      // Our frontend service layer filters these out
      if (pastEndDateEvents.length > 0) {
        console.log(`Found ${pastEndDateEvents.length} events with past endDates (expected Gamma API behavior)`);
      }

      // Test passes regardless - we're just verifying the API call works
      expect(Array.isArray(events)).toBe(true);
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

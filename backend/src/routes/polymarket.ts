import { Hono } from "hono";
import { polymarketClient } from "../lib/polymarket-client.js";
import { kalshiClient } from "../lib/kalshi-client.js";
import { opinionClient } from "../lib/opinion-client.js";
import { limitlessClient } from "../lib/limitless-client.js";
import {
  transformPolymarketMarket,
  transformPolymarketEvent,
  transformKalshiMarket,
  transformKalshiEvent,
  transformOpinionMarket,
  transformOpinionEvent,
  transformLimitlessMarket,
  transformLimitlessEvent,
} from "../lib/transforms.js";
import type { Platform, UnifiedMarket, UnifiedEvent } from "../lib/types.js";

const polymarket = new Hono();

// GET /api/markets - List markets
polymarket.get("/markets", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending, platform } =
      c.req.query();

    const platformFilter = platform as Platform | undefined;
    const results: UnifiedMarket[] = [];

    // Fetch from Polymarket if no filter or filter is polymarket
    if (!platformFilter || platformFilter === "polymarket") {
      try {
        const polymarketData = await polymarketClient.getMarkets({
          limit,
          offset,
          active,
          closed,
          order,
          ascending,
        });
        results.push(...polymarketData.map(transformPolymarketMarket));
      } catch (error) {
        console.error("Error fetching Polymarket markets:", error);
      }
    }

    // Fetch from Kalshi if no filter or filter is kalshi
    if (!platformFilter || platformFilter === "kalshi") {
      try {
        const kalshiData = await kalshiClient.getMarkets({
          limit: limit || "100",
          status: active === "true" ? "open" : undefined,
        });
        results.push(...kalshiData.map(transformKalshiMarket));
      } catch (error) {
        console.error("Error fetching Kalshi markets:", error);
      }
    }

    // Fetch from Opinion if no filter or filter is opinion
    if (!platformFilter || platformFilter === "opinion") {
      try {
        const opinionData = await opinionClient.getMarkets({
          limit: limit || "100",
          active: active,
        });
        results.push(...opinionData.map(transformOpinionMarket));
      } catch (error) {
        console.error("Error fetching Opinion markets:", error);
      }
    }

    // Fetch from Limitless if no filter or filter is limitless
    if (!platformFilter || platformFilter === "limitless") {
      try {
        const limitlessData = await limitlessClient.getMarkets({
          limit,
          page: offset ? (parseInt(offset) + 1).toString() : "1",
          sortBy: "volume", // default sort
        });
        results.push(...limitlessData.map(transformLimitlessMarket));
      } catch (error) {
        console.error("Error fetching Limitless markets:", error);
      }
    }

    // Sort by volume descending if not filtered to single platform
    if (!platformFilter) {
      results.sort(
        (a, b) => parseFloat(b.volume || "0") - parseFloat(a.volume || "0")
      );
    }

    return c.json({ data: results });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return c.json({ error: "Failed to fetch markets" }, 500);
  }
});

// GET /api/markets/search - Search markets
polymarket.get("/markets/search", async (c) => {
  try {
    const query = c.req.query("q");
    if (!query) {
      return c.json({ error: "Query parameter 'q' is required" }, 400);
    }

    const results: UnifiedMarket[] = [];

    // Search Polymarket
    try {
      const polymarketData = await polymarketClient.searchMarkets(query);
      results.push(...polymarketData.map(transformPolymarketMarket));
    } catch (error) {
      console.error("Error searching Polymarket:", error);
    }

    // Note: Kalshi doesn't have a search endpoint, so we can't search there

    return c.json({ data: results });
  } catch (error) {
    console.error("Error searching markets:", error);
    return c.json({ error: "Failed to search markets" }, 500);
  }
});

// GET /api/markets/:id - Get market by ID
polymarket.get("/markets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { platform } = c.req.query();

    // If platform specified, use that
    if (platform === "kalshi") {
      const market = await kalshiClient.getMarket(id);
      return c.json({ data: transformKalshiMarket(market) });
    }

    if (platform === "polymarket") {
      const market = await polymarketClient.getMarket(id);
      return c.json({ data: transformPolymarketMarket(market) });
    }

    if (platform === "opinion") {
      const market = await opinionClient.getMarket(id);
      return c.json({ data: transformOpinionMarket(market) });
    }

    if (platform === "limitless") {
      const market = await limitlessClient.getMarket(id);
      return c.json({ data: transformLimitlessMarket(market) });
    }

    // Try Polymarket first (original behavior for backwards compatibility)
    try {
      const market = await polymarketClient.getMarket(id);
      return c.json({ data: transformPolymarketMarket(market) });
    } catch {
      // If not found, try Kalshi
      try {
        const market = await kalshiClient.getMarket(id);
        return c.json({ data: transformKalshiMarket(market) });
      } catch {
        // If not found, try Opinion
        try {
          const market = await opinionClient.getMarket(id);
          return c.json({ data: transformOpinionMarket(market) });
        } catch {
          // If not found, try Limitless
          try {
            const market = await limitlessClient.getMarket(id);
            return c.json({ data: transformLimitlessMarket(market) });
          } catch {
            return c.json({ error: "Market not found" }, 404);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching market:", error);
    return c.json({ error: "Failed to fetch market" }, 500);
  }
});

// GET /api/events - List events
polymarket.get("/events", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending, platform } =
      c.req.query();

    const platformFilter = platform as Platform | undefined;
    const results: UnifiedEvent[] = [];

    // Fetch from Polymarket if no filter or filter is polymarket
    if (!platformFilter || platformFilter === "polymarket") {
      try {
        const polymarketData = await polymarketClient.getEvents({
          limit,
          offset,
          active,
          closed,
          order,
          ascending,
        });
        results.push(...polymarketData.map(transformPolymarketEvent));
      } catch (error) {
        console.error("Error fetching Polymarket events:", error);
      }
    }

    // Fetch from Kalshi if no filter or filter is kalshi
    if (!platformFilter || platformFilter === "kalshi") {
      try {
        const kalshiData = await kalshiClient.getEvents({
          limit: limit || "100",
          status: active === "true" ? "open" : undefined,
          with_nested_markets: "true",
        });
        results.push(...kalshiData.map(transformKalshiEvent));
      } catch (error) {
        console.error("Error fetching Kalshi events:", error);
      }
    }

    // Fetch from Opinion if no filter or filter is opinion
    if (!platformFilter || platformFilter === "opinion") {
      try {
        const opinionData = await opinionClient.getEvents({
          limit: limit || "100",
          active: active,
        });
        results.push(...opinionData.map(transformOpinionEvent));
      } catch (error) {
        console.error("Error fetching Opinion events:", error);
      }
    }

    // Fetch from Limitless if no filter or filter is limitless
    if (!platformFilter || platformFilter === "limitless") {
      try {
        // Limitless API structure is markets-first. We reuse getMarkets for events for now.
        const limitlessData = await limitlessClient.getMarkets({
          limit,
          page: offset ? (parseInt(offset) + 1).toString() : "1",
        });
        results.push(...limitlessData.map(transformLimitlessEvent));
      } catch (error) {
        console.error("Error fetching Limitless events:", error);
      }
    }

    // Sort by volume descending if not filtered to single platform
    if (!platformFilter) {
      results.sort((a, b) => b.volume - a.volume);
    }

    return c.json({ data: results });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

// GET /api/events/:id - Get event by ID
polymarket.get("/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { platform } = c.req.query();

    // If platform specified, use that
    if (platform === "kalshi") {
      const event = await kalshiClient.getEvent(id);
      return c.json({ data: transformKalshiEvent(event) });
    }

    if (platform === "polymarket") {
      const event = await polymarketClient.getEvent(id);
      return c.json({ data: transformPolymarketEvent(event) });
    }

    if (platform === "opinion") {
      const event = await opinionClient.getEvent(id);
      return c.json({ data: transformOpinionEvent(event) });
    }

    if (platform === "limitless") {
      const event = await limitlessClient.getMarket(id); // Using getMarket as 1:1 map
      return c.json({ data: transformLimitlessEvent(event) });
    }

    // Try Polymarket first (original behavior for backwards compatibility)
    try {
      const event = await polymarketClient.getEvent(id);
      return c.json({ data: transformPolymarketEvent(event) });
    } catch {
      // If not found, try Kalshi
      try {
        const event = await kalshiClient.getEvent(id);
        return c.json({ data: transformKalshiEvent(event) });
      } catch {
        // If not found, try Opinion
        try {
          const event = await opinionClient.getEvent(id);
          return c.json({ data: transformOpinionEvent(event) });
        } catch {
          // If not found, try Limitless
          try {
            const event = await limitlessClient.getMarket(id);
            return c.json({ data: transformLimitlessEvent(event) });
          } catch {
            return c.json({ error: "Event not found" }, 404);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    return c.json({ error: "Failed to fetch event" }, 500);
  }
});

export { polymarket };

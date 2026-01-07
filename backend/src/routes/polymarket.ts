import { Hono } from "hono";
import { polymarketClient } from "../lib/polymarket-client.js";

const polymarket = new Hono();

// GET /api/markets - List markets
polymarket.get("/markets", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending } = c.req.query();
    const markets = await polymarketClient.getMarkets({
      limit,
      offset,
      active,
      closed,
      order,
      ascending,
    });
    return c.json({ data: markets });
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
    const markets = await polymarketClient.searchMarkets(query);
    return c.json({ data: markets });
  } catch (error) {
    console.error("Error searching markets:", error);
    return c.json({ error: "Failed to search markets" }, 500);
  }
});

// GET /api/markets/:id - Get market by ID
polymarket.get("/markets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const market = await polymarketClient.getMarket(id);
    return c.json({ data: market });
  } catch (error) {
    console.error("Error fetching market:", error);
    return c.json({ error: "Failed to fetch market" }, 500);
  }
});

// GET /api/events - List events
polymarket.get("/events", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending } = c.req.query();
    const events = await polymarketClient.getEvents({
      limit,
      offset,
      active,
      closed,
      order,
      ascending,
    });
    return c.json({ data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

// GET /api/events/:id - Get event by ID
polymarket.get("/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const event = await polymarketClient.getEvent(id);
    return c.json({ data: event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return c.json({ error: "Failed to fetch event" }, 500);
  }
});

export { polymarket };

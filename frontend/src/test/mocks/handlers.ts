import { http, HttpResponse } from "msw";
import { mockMarkets, mockMarket, mockKalshiMarkets } from "./data/markets";
import { mockEvents, mockEvent, mockKalshiEvents } from "./data/events";

export const handlers = [
  // GET /api/markets
  http.get("/api/markets", ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const platform = url.searchParams.get("platform");

    let markets = [...mockMarkets, ...mockKalshiMarkets];

    if (platform === "polymarket") {
      markets = mockMarkets;
    } else if (platform === "kalshi") {
      markets = mockKalshiMarkets;
    }

    return HttpResponse.json({
      data: markets.slice(0, limit),
    });
  }),

  // GET /api/markets/search
  http.get("/api/markets/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return HttpResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const filtered = mockMarkets.filter((m) =>
      m.question.toLowerCase().includes(query.toLowerCase())
    );
    return HttpResponse.json({ data: filtered });
  }),

  // GET /api/markets/:id
  http.get("/api/markets/:id", ({ params }) => {
    const { id } = params;

    if (id === "not-found") {
      return HttpResponse.json({ error: "Market not found" }, { status: 404 });
    }

    return HttpResponse.json({ data: { ...mockMarket, id } });
  }),

  // GET /api/events
  http.get("/api/events", ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const order = url.searchParams.get("order");
    const ascending = url.searchParams.get("ascending") === "true";
    const platform = url.searchParams.get("platform");

    let events = [...mockEvents, ...mockKalshiEvents];

    if (platform === "polymarket") {
      events = [...mockEvents];
    } else if (platform === "kalshi") {
      events = [...mockKalshiEvents];
    }

    // Sort by volume if requested
    if (order === "volume") {
      events.sort((a, b) =>
        ascending ? a.volume - b.volume : b.volume - a.volume
      );
    }

    return HttpResponse.json({
      data: events.slice(0, limit),
    });
  }),

  // GET /api/events/:id
  http.get("/api/events/:id", ({ params }) => {
    const { id } = params;

    if (id === "not-found") {
      return HttpResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return HttpResponse.json({ data: { ...mockEvent, id } });
  }),
];

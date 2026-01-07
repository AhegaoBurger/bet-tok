import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Gamma API client (inlined from backend/src/lib/polymarket-client.ts)
const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

async function fetchGamma<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${GAMMA_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// Create Hono app with /api base path
const app = new Hono().basePath("/api");

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow same-origin requests
      if (!origin) return "*";
      // Allow localhost for development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return origin;
      }
      // Allow Vercel preview and production domains
      if (origin.endsWith(".vercel.app")) {
        return origin;
      }
      // Allow custom production domain if set
      if (
        process.env.PRODUCTION_DOMAIN &&
        origin.includes(process.env.PRODUCTION_DOMAIN)
      ) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", environment: process.env.VERCEL_ENV || "local" })
);

// GET /api/markets - List markets
app.get("/markets", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending } = c.req.query();
    const markets = await fetchGamma("/markets", {
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
app.get("/markets/search", async (c) => {
  try {
    const query = c.req.query("q");
    if (!query) {
      return c.json({ error: "Query parameter 'q' is required" }, 400);
    }
    const markets = await fetchGamma("/markets", { _q: query, active: "true" });
    return c.json({ data: markets });
  } catch (error) {
    console.error("Error searching markets:", error);
    return c.json({ error: "Failed to search markets" }, 500);
  }
});

// GET /api/markets/:id - Get market by ID
app.get("/markets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const market = await fetchGamma(`/markets/${id}`);
    return c.json({ data: market });
  } catch (error) {
    console.error("Error fetching market:", error);
    return c.json({ error: "Failed to fetch market" }, 500);
  }
});

// GET /api/events - List events
app.get("/events", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending } = c.req.query();
    const events = await fetchGamma("/events", {
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
app.get("/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const event = await fetchGamma(`/events/${id}`);
    return c.json({ data: event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return c.json({ error: "Failed to fetch event" }, 500);
  }
});

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// Export for Vercel
export default handle(app);

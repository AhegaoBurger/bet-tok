import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

// Vercel Edge Runtime config
export const config = {
  runtime: "edge",
};

// Types
type Platform = "polymarket" | "kalshi" | "opinion";

interface UnifiedMarket {
  id: string;
  question: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  category: string;
  volume24hr: string;
  platform: Platform;
  platformUrl: string;
  conditionId?: string;
  marketMakerAddress?: string;
  submitted_by?: string;
  groupItemTitle?: string;
  groupItemThreshold?: string;
  negRisk?: boolean;
  negRiskMarketID?: string;
  ticker?: string;
  // Opinion-specific fields
  conditionIdOpinion?: string;
  questionId?: string;
}

interface UnifiedEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  markets: UnifiedMarket[];
  platform: Platform;
  platformUrl: string;
  ticker?: string;
  // Opinion-specific fields
  questionId?: string;
}

// API Base URLs
const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";
const OPINION_API_BASE = "https://proxy.opinion.trade:8443";
const FETCH_TIMEOUT = 25000; // 25 second timeout

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

  console.log(`[fetchGamma] Fetching: ${url.toString()}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[fetchGamma] Success: ${endpoint}`);
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Gamma API timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

// Kalshi API client
interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  open_time: string;
  close_time: string;
  status: string;
  last_price: number;
  volume: number;
  volume_24h: number;
  liquidity: number;
  category: string;
  rules_primary: string;
  settlement_source_url: string;
  // Dollar-denominated fields
  volume_fp: string;
  volume_24h_fp: string;
  liquidity_dollars: string;
}

interface KalshiEvent {
  event_ticker: string;
  title: string;
  sub_title: string;
  category: string;
  markets: KalshiMarket[];
}

async function fetchKalshi<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${KALSHI_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  console.log(`[fetchKalshi] Fetching: ${url.toString()}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[fetchKalshi] Success: ${endpoint}`);
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Kalshi API timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

// Opinion API client
interface OpinionToken {
  token_id: string;
  outcome: string;
  price: number;
  winner: boolean;
}

interface OpinionMarket {
  condition_id: string;
  question_id: string;
  question: string;
  description: string;
  market_slug: string;
  category: string;
  end_date_iso: string;
  game_start_time: string | null;
  active: boolean;
  closed: boolean;
  archived: boolean;
  accepting_orders: boolean;
  accepting_order_timestamp: string | null;
  tokens: OpinionToken[];
  icon: string;
  image: string;
  neg_risk: boolean;
  neg_risk_market_id: string;
  volume?: string;
  liquidity?: string;
}

interface OpinionEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  markets: OpinionMarket[];
  volume?: number;
  liquidity?: number;
}

async function fetchOpinion<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${OPINION_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  console.log(`[fetchOpinion] Fetching: ${url.toString()}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Opinion API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[fetchOpinion] Success: ${endpoint}`);
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Opinion API timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  }
}

// Transform functions
interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  marketMakerAddress: string;
  createdAt: string;
  updatedAt: string;
  new: boolean;
  featured: boolean;
  submitted_by: string;
  category: string;
  volume24hr: string;
  groupItemTitle?: string;
  groupItemThreshold?: string;
  negRisk?: boolean;
  negRiskMarketID?: string;
}

interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  creationDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  markets: GammaMarket[];
}

function transformPolymarketMarket(market: GammaMarket): UnifiedMarket {
  return {
    ...market,
    platform: "polymarket",
    platformUrl: `https://polymarket.com/market/${market.slug}`,
  };
}

function transformPolymarketEvent(event: GammaEvent): UnifiedEvent {
  return {
    ...event,
    platform: "polymarket",
    platformUrl: `https://polymarket.com/event/${event.slug}`,
    markets: event.markets.map(transformPolymarketMarket),
  };
}

function transformKalshiMarket(market: KalshiMarket): UnifiedMarket {
  const yesPrice = market.last_price / 100;
  const noPrice = 1 - yesPrice;

  // Use dollar-denominated fields (liquidity_dollars, volume_fp are in dollars)
  // Fall back to converting cents if dollar fields not available
  const volumeDollars = market.volume_fp || market.volume.toString();
  const volume24hDollars = market.volume_24h_fp || market.volume_24h.toString();
  const liquidityDollars =
    market.liquidity_dollars || (market.liquidity / 100).toString();

  return {
    id: market.ticker,
    ticker: market.ticker,
    question: market.title,
    slug: market.ticker.toLowerCase(),
    resolutionSource: market.settlement_source_url || "",
    endDate: market.close_time,
    liquidity: liquidityDollars,
    startDate: market.open_time,
    image: "",
    icon: "",
    description: market.rules_primary || "",
    outcomes: JSON.stringify(["Yes", "No"]),
    outcomePrices: JSON.stringify([yesPrice.toString(), noPrice.toString()]),
    volume: volumeDollars,
    active: market.status === "active" || market.status === "open",
    closed: market.status === "closed" || market.status === "settled",
    createdAt: market.open_time,
    updatedAt: market.open_time,
    new: false,
    featured: false,
    category: market.category || "",
    volume24hr: volume24hDollars,
    platform: "kalshi",
    platformUrl: `https://kalshi.com/markets/${market.ticker}`,
    groupItemTitle: market.subtitle || undefined,
  };
}

function transformKalshiEvent(event: KalshiEvent): UnifiedEvent {
  const markets = event.markets.map(transformKalshiMarket);

  const totalVolume = markets.reduce(
    (sum, m) => sum + parseFloat(m.volume || "0"),
    0
  );
  const totalLiquidity = markets.reduce(
    (sum, m) => sum + parseFloat(m.liquidity || "0"),
    0
  );

  const hasActiveMarkets = markets.some((m) => m.active);
  const allMarketsClosed = markets.every((m) => m.closed);

  const startDates = markets
    .map((m) => new Date(m.startDate))
    .filter((d) => !isNaN(d.getTime()));
  const endDates = markets
    .map((m) => new Date(m.endDate))
    .filter((d) => !isNaN(d.getTime()));

  const earliestStart =
    startDates.length > 0
      ? new Date(Math.min(...startDates.map((d) => d.getTime()))).toISOString()
      : new Date().toISOString();
  const latestEnd =
    endDates.length > 0
      ? new Date(Math.max(...endDates.map((d) => d.getTime()))).toISOString()
      : new Date().toISOString();

  return {
    id: event.event_ticker,
    ticker: event.event_ticker,
    title: event.title,
    slug: event.event_ticker.toLowerCase(),
    description: event.sub_title || "",
    startDate: earliestStart,
    creationDate: earliestStart,
    endDate: latestEnd,
    image: "",
    icon: "",
    active: hasActiveMarkets,
    closed: allMarketsClosed,
    archived: false,
    new: false,
    featured: false,
    restricted: false,
    liquidity: totalLiquidity,
    volume: totalVolume,
    markets,
    platform: "kalshi",
    platformUrl: `https://kalshi.com/events/${event.event_ticker}`,
  };
}

function transformOpinionMarket(market: OpinionMarket): UnifiedMarket {
  const outcomes = market.tokens.map((t) => t.outcome);
  const outcomePrices = market.tokens.map((t) => t.price.toString());

  return {
    id: market.condition_id,
    question: market.question,
    slug: market.market_slug,
    resolutionSource: "",
    endDate: market.end_date_iso,
    liquidity: market.liquidity || "0",
    startDate: market.accepting_order_timestamp || market.game_start_time || new Date().toISOString(),
    image: market.image || "",
    icon: market.icon || "",
    description: market.description || "",
    outcomes: JSON.stringify(outcomes),
    outcomePrices: JSON.stringify(outcomePrices),
    volume: market.volume || "0",
    active: market.active && market.accepting_orders,
    closed: market.closed,
    createdAt: market.accepting_order_timestamp || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    new: false,
    featured: false,
    category: market.category || "",
    volume24hr: "0",
    platform: "opinion",
    platformUrl: `https://opinion.trade/market/${market.market_slug}`,
    conditionIdOpinion: market.condition_id,
    questionId: market.question_id,
    negRisk: market.neg_risk,
    negRiskMarketID: market.neg_risk_market_id || undefined,
  };
}

function transformOpinionEvent(event: OpinionEvent): UnifiedEvent {
  const markets = event.markets.map(transformOpinionMarket);

  const totalVolume = markets.reduce(
    (sum, m) => sum + parseFloat(m.volume || "0"),
    0
  );
  const totalLiquidity = markets.reduce(
    (sum, m) => sum + parseFloat(m.liquidity || "0"),
    0
  );

  const hasActiveMarkets = markets.some((m) => m.active);
  const allMarketsClosed = markets.every((m) => m.closed);

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description || "",
    startDate: event.start_date,
    creationDate: event.start_date,
    endDate: event.end_date,
    image: event.image || "",
    icon: event.icon || "",
    active: hasActiveMarkets,
    closed: allMarketsClosed,
    archived: event.archived,
    new: false,
    featured: false,
    restricted: false,
    liquidity: event.liquidity || totalLiquidity,
    volume: event.volume || totalVolume,
    markets,
    platform: "opinion",
    platformUrl: `https://opinion.trade/event/${event.slug}`,
    questionId: event.id,
  };
}

// Create Hono app with /api base path
const app = new Hono().basePath("/api");

console.log("[api] Hono app initialized");

// CORS Middleware
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return origin;
      }
      if (origin.endsWith(".vercel.app")) {
        return origin;
      }
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
  console.log("[api/markets] Request received");
  try {
    const { limit, offset, active, closed, order, ascending, platform } =
      c.req.query();

    const platformFilter = platform as Platform | undefined;
    const results: UnifiedMarket[] = [];

    // Fetch from Polymarket
    if (!platformFilter || platformFilter === "polymarket") {
      try {
        const markets = await fetchGamma<GammaMarket[]>("/markets", {
          limit,
          offset,
          active,
          closed,
          order,
          ascending,
        });
        results.push(...markets.map(transformPolymarketMarket));
      } catch (error) {
        console.error("[api/markets] Polymarket error:", error);
      }
    }

    // Fetch from Kalshi
    if (!platformFilter || platformFilter === "kalshi") {
      try {
        const response = await fetchKalshi<{ markets: KalshiMarket[] }>("/markets", {
          limit: limit || "100",
          status: active === "true" ? "open" : undefined,
        });
        // Filter out multivariate extended sports markets (parlay bets with ugly auto-generated titles)
        const filteredMarkets = response.markets.filter(
          (m) => !m.ticker.includes("MVEEXTENDED") && !m.ticker.includes("MULTIGAME")
        );
        results.push(...filteredMarkets.map(transformKalshiMarket));
      } catch (error) {
        console.error("[api/markets] Kalshi error:", error);
      }
    }

    // Fetch from Opinion
    if (!platformFilter || platformFilter === "opinion") {
      try {
        const response = await fetchOpinion<{ data: OpinionMarket[] }>("/markets", {
          limit: limit || "100",
          active: active,
        });
        results.push(...(response.data || []).map(transformOpinionMarket));
      } catch (error) {
        console.error("[api/markets] Opinion error:", error);
      }
    }

    // Sort by volume descending
    if (!platformFilter) {
      results.sort(
        (a, b) => parseFloat(b.volume || "0") - parseFloat(a.volume || "0")
      );
    }

    console.log("[api/markets] Returning", results.length, "markets");
    return c.json({ data: results });
  } catch (error) {
    console.error("[api/markets] Error:", error);
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

    const results: UnifiedMarket[] = [];

    try {
      const markets = await fetchGamma<GammaMarket[]>("/markets", {
        _q: query,
        active: "true",
      });
      results.push(...markets.map(transformPolymarketMarket));
    } catch (error) {
      console.error("Error searching Polymarket:", error);
    }

    return c.json({ data: results });
  } catch (error) {
    console.error("Error searching markets:", error);
    return c.json({ error: "Failed to search markets" }, 500);
  }
});

// GET /api/markets/:id - Get market by ID
app.get("/markets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { platform } = c.req.query();

    if (platform === "kalshi") {
      const response = await fetchKalshi<{ market: KalshiMarket }>(`/markets/${id}`);
      return c.json({ data: transformKalshiMarket(response.market) });
    }

    if (platform === "polymarket") {
      const market = await fetchGamma<GammaMarket>(`/markets/${id}`);
      return c.json({ data: transformPolymarketMarket(market) });
    }

    if (platform === "opinion") {
      const response = await fetchOpinion<{ data: OpinionMarket }>(`/markets/${id}`);
      return c.json({ data: transformOpinionMarket(response.data) });
    }

    // Try Polymarket first
    try {
      const market = await fetchGamma<GammaMarket>(`/markets/${id}`);
      return c.json({ data: transformPolymarketMarket(market) });
    } catch {
      // Try Kalshi
      try {
        const response = await fetchKalshi<{ market: KalshiMarket }>(`/markets/${id}`);
        return c.json({ data: transformKalshiMarket(response.market) });
      } catch {
        // Try Opinion
        try {
          const response = await fetchOpinion<{ data: OpinionMarket }>(`/markets/${id}`);
          return c.json({ data: transformOpinionMarket(response.data) });
        } catch {
          return c.json({ error: "Market not found" }, 404);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching market:", error);
    return c.json({ error: "Failed to fetch market" }, 500);
  }
});

// GET /api/events - List events
app.get("/events", async (c) => {
  try {
    const { limit, offset, active, closed, order, ascending, platform } =
      c.req.query();

    const platformFilter = platform as Platform | undefined;
    const results: UnifiedEvent[] = [];

    // Fetch from Polymarket
    if (!platformFilter || platformFilter === "polymarket") {
      try {
        const events = await fetchGamma<GammaEvent[]>("/events", {
          limit,
          offset,
          active,
          closed,
          order,
          ascending,
        });
        results.push(...events.map(transformPolymarketEvent));
      } catch (error) {
        console.error("[api/events] Polymarket error:", error);
      }
    }

    // Fetch from Kalshi
    if (!platformFilter || platformFilter === "kalshi") {
      try {
        const response = await fetchKalshi<{ events: KalshiEvent[] }>("/events", {
          limit: limit || "100",
          status: active === "true" ? "open" : undefined,
          with_nested_markets: "true",
        });
        // Filter out multivariate extended sports events (parlay bets with ugly auto-generated titles)
        const filteredEvents = response.events.filter(
          (e) => !e.event_ticker.includes("MVEEXTENDED") && !e.event_ticker.includes("MULTIGAME")
        );
        results.push(...filteredEvents.map(transformKalshiEvent));
      } catch (error) {
        console.error("[api/events] Kalshi error:", error);
      }
    }

    // Fetch from Opinion (markets grouped as events)
    if (!platformFilter || platformFilter === "opinion") {
      try {
        const response = await fetchOpinion<{ data: OpinionMarket[] }>("/markets", {
          limit: limit || "100",
          active: active,
        });
        // Group Opinion markets by question_id to create pseudo-events
        const eventMap = new Map<string, OpinionEvent>();
        for (const market of response.data || []) {
          const eventId = market.question_id || market.condition_id;
          if (!eventMap.has(eventId)) {
            eventMap.set(eventId, {
              id: eventId,
              title: market.question,
              slug: market.market_slug,
              description: market.description,
              category: market.category,
              start_date: market.accepting_order_timestamp || new Date().toISOString(),
              end_date: market.end_date_iso,
              image: market.image,
              icon: market.icon,
              active: market.active,
              closed: market.closed,
              archived: market.archived,
              markets: [],
              volume: 0,
              liquidity: 0,
            });
          }
          const event = eventMap.get(eventId)!;
          event.markets.push(market);
          if (market.volume) event.volume = (event.volume || 0) + parseFloat(market.volume);
          if (market.liquidity) event.liquidity = (event.liquidity || 0) + parseFloat(market.liquidity);
          event.active = event.active || market.active;
          event.closed = event.closed && market.closed;
        }
        results.push(...Array.from(eventMap.values()).map(transformOpinionEvent));
      } catch (error) {
        console.error("[api/events] Opinion error:", error);
      }
    }

    // Sort by volume descending
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
app.get("/events/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { platform } = c.req.query();

    if (platform === "kalshi") {
      const response = await fetchKalshi<{ event: KalshiEvent }>(`/events/${id}`);
      return c.json({ data: transformKalshiEvent(response.event) });
    }

    if (platform === "polymarket") {
      const event = await fetchGamma<GammaEvent>(`/events/${id}`);
      return c.json({ data: transformPolymarketEvent(event) });
    }

    if (platform === "opinion") {
      const response = await fetchOpinion<{ data: OpinionMarket }>(`/markets/${id}`);
      const market = response.data;
      const event: OpinionEvent = {
        id: market.question_id || market.condition_id,
        title: market.question,
        slug: market.market_slug,
        description: market.description,
        category: market.category,
        start_date: market.accepting_order_timestamp || new Date().toISOString(),
        end_date: market.end_date_iso,
        image: market.image,
        icon: market.icon,
        active: market.active,
        closed: market.closed,
        archived: market.archived,
        markets: [market],
        volume: market.volume ? parseFloat(market.volume) : 0,
        liquidity: market.liquidity ? parseFloat(market.liquidity) : 0,
      };
      return c.json({ data: transformOpinionEvent(event) });
    }

    // Try Polymarket first
    try {
      const event = await fetchGamma<GammaEvent>(`/events/${id}`);
      return c.json({ data: transformPolymarketEvent(event) });
    } catch {
      // Try Kalshi
      try {
        const response = await fetchKalshi<{ event: KalshiEvent }>(`/events/${id}`);
        return c.json({ data: transformKalshiEvent(response.event) });
      } catch {
        // Try Opinion
        try {
          const response = await fetchOpinion<{ data: OpinionMarket }>(`/markets/${id}`);
          const market = response.data;
          const event: OpinionEvent = {
            id: market.question_id || market.condition_id,
            title: market.question,
            slug: market.market_slug,
            description: market.description,
            category: market.category,
            start_date: market.accepting_order_timestamp || new Date().toISOString(),
            end_date: market.end_date_iso,
            image: market.image,
            icon: market.icon,
            active: market.active,
            closed: market.closed,
            archived: market.archived,
            markets: [market],
            volume: market.volume ? parseFloat(market.volume) : 0,
            liquidity: market.liquidity ? parseFloat(market.liquidity) : 0,
          };
          return c.json({ data: transformOpinionEvent(event) });
        } catch {
          return c.json({ error: "Event not found" }, 404);
        }
      }
    }
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

import type { GammaMarket, GammaEvent } from "./polymarket-client.js";
import type { KalshiMarket, KalshiEvent } from "./kalshi-client.js";
import type { OpinionMarket, OpinionEvent } from "./opinion-client.js";
import type { LimitlessMarket } from "./limitless-client.js";
import type { UnifiedMarket, UnifiedEvent } from "./types.js";

// Polymarket transforms
export function transformPolymarketMarket(market: GammaMarket): UnifiedMarket {
  return {
    ...market,
    platform: "polymarket",
    platformUrl: `https://polymarket.com/market/${market.slug}`,
  };
}

export function transformPolymarketEvent(event: GammaEvent): UnifiedEvent {
  return {
    ...event,
    platform: "polymarket",
    platformUrl: `https://polymarket.com/event/${event.slug}`,
    markets: event.markets.map(transformPolymarketMarket),
  };
}

// Kalshi transforms
export function transformKalshiMarket(market: KalshiMarket): UnifiedMarket {
  // Convert Kalshi price (0-100 cents) to decimal (0-1)
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
    image: "", // Kalshi doesn't provide images in the API
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
    // Kalshi-specific
    groupItemTitle: market.subtitle || undefined,
  };
}

export function transformKalshiEvent(event: KalshiEvent): UnifiedEvent {
  const markets = event.markets.map(transformKalshiMarket);

  // Calculate aggregated stats
  const totalVolume = markets.reduce(
    (sum, m) => sum + parseFloat(m.volume || "0"),
    0
  );
  const totalLiquidity = markets.reduce(
    (sum, m) => sum + parseFloat(m.liquidity || "0"),
    0
  );

  // Determine if event is active (has any active markets)
  const hasActiveMarkets = markets.some((m) => m.active);
  const allMarketsClosed = markets.every((m) => m.closed);

  // Get earliest start date and latest end date
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
    image: "", // Kalshi doesn't provide images
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

// Opinion transforms
export function transformOpinionMarket(market: OpinionMarket): UnifiedMarket {
  // Extract outcomes and prices from tokens array
  const outcomes = market.tokens.map((t) => t.outcome);
  const outcomePrices = market.tokens.map((t) => t.price.toString());

  return {
    id: market.condition_id,
    question: market.question,
    slug: market.market_slug,
    resolutionSource: "", // Opinion doesn't provide this
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
    volume24hr: "0", // Opinion doesn't provide 24h volume
    platform: "opinion",
    platformUrl: `https://opinion.trade/market/${market.market_slug}`,
    // Opinion-specific
    conditionIdOpinion: market.condition_id,
    questionId: market.question_id,
    negRisk: market.neg_risk,
    negRiskMarketID: market.neg_risk_market_id || undefined,
  };
}

export function transformOpinionEvent(event: OpinionEvent): UnifiedEvent {
  const markets = event.markets.map(transformOpinionMarket);

  // Calculate aggregated stats
  const totalVolume = markets.reduce(
    (sum, m) => sum + parseFloat(m.volume || "0"),
    0
  );
  const totalLiquidity = markets.reduce(
    (sum, m) => sum + parseFloat(m.liquidity || "0"),
    0
  );

  // Determine if event is active (has any active markets)
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

// Limitless transforms
export function transformLimitlessMarket(market: LimitlessMarket): UnifiedMarket {
  const outcomes = market.outcomes.map((o) => o.name);
  const outcomePrices = market.prices.map((p) => p.toString());

  return {
    id: market.address, // Using address as ID ensures uniqueness
    question: market.title,
    slug: market.slug,
    resolutionSource: "", // Not provided in basic fields
    endDate: new Date(market.expirationTimestamp).toISOString(),
    liquidity: market.liquidity || "0",
    startDate: new Date().toISOString(), // Not provided, using current time or deriving? CreatedAt missing.
    image: "",
    icon: "",
    description: market.description || "",
    outcomes: JSON.stringify(outcomes),
    outcomePrices: JSON.stringify(outcomePrices),
    volume: market.volume || "0",
    active: true, // If fetched from /markets/active
    closed: false,
    createdAt: new Date().toISOString(), // Missing
    updatedAt: new Date().toISOString(),
    new: false,
    featured: false,
    category: "",
    volume24hr: "0",
    platform: "limitless",
    platformUrl: `https://limitless.exchange/markets/${market.slug}`,
  };
}

export function transformLimitlessEvent(market: LimitlessMarket): UnifiedEvent {
  // Limitless markets seem to be 1:1 with events in this API view (one question per market)
  const unifiedMarket = transformLimitlessMarket(market);

  return {
    id: market.address,
    title: market.title,
    slug: market.slug,
    description: market.description || "",
    startDate: unifiedMarket.startDate,
    creationDate: unifiedMarket.createdAt,
    endDate: unifiedMarket.endDate,
    image: "",
    icon: "",
    active: unifiedMarket.active,
    closed: unifiedMarket.closed,
    archived: false,
    new: false,
    featured: false,
    restricted: false,
    liquidity: parseFloat(market.liquidity || "0"),
    volume: parseFloat(market.volume || "0"),
    markets: [unifiedMarket],
    platform: "limitless",
    platformUrl: `https://limitless.exchange/markets/${market.slug}`,
  };
}

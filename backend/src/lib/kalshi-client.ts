const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";

// Kalshi API Response Types
export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  open_time: string;
  close_time: string;
  expected_expiration_time: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: string;
  response_price_units: string;
  notional_value: number;
  tick_size: number;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  previous_yes_bid: number;
  previous_yes_ask: number;
  previous_price: number;
  volume: number;
  volume_24h: number;
  liquidity: number;
  open_interest: number;
  result: string;
  can_close_early: boolean;
  expiration_value: string;
  category: string;
  risk_limit_cents: number;
  strike_type: string;
  floor_strike: number | null;
  cap_strike: number | null;
  rules_primary: string;
  rules_secondary: string;
  settlement_source_url: string;
  // Dollar-denominated fields
  volume_fp: string;
  volume_24h_fp: string;
  liquidity_dollars: string;
}

export interface KalshiEvent {
  event_ticker: string;
  series_ticker: string;
  sub_title: string;
  title: string;
  mutually_exclusive: boolean;
  category: string;
  markets: KalshiMarket[];
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor: string;
}

export interface KalshiEventsResponse {
  events: KalshiEvent[];
  cursor: string;
}

export interface KalshiEventResponse {
  event: KalshiEvent;
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

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kalshi API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const kalshiClient = {
  async getMarkets(params?: {
    limit?: string;
    cursor?: string;
    event_ticker?: string;
    status?: string;
  }): Promise<KalshiMarket[]> {
    const response = await fetchKalshi<KalshiMarketsResponse>("/markets", params);
    // Filter out multivariate extended sports markets (parlay bets with ugly auto-generated titles)
    return response.markets.filter(
      (m) => !m.ticker.includes("MVEEXTENDED") && !m.ticker.includes("MULTIGAME")
    );
  },

  async getMarket(ticker: string): Promise<KalshiMarket> {
    const response = await fetchKalshi<{ market: KalshiMarket }>(`/markets/${ticker}`);
    return response.market;
  },

  async getEvents(params?: {
    limit?: string;
    cursor?: string;
    status?: string;
    with_nested_markets?: string;
  }): Promise<KalshiEvent[]> {
    const response = await fetchKalshi<KalshiEventsResponse>("/events", {
      ...params,
      with_nested_markets: params?.with_nested_markets ?? "true",
    });
    // Filter out multivariate extended sports events (parlay bets with ugly auto-generated titles)
    return response.events.filter(
      (e) => !e.event_ticker.includes("MVEEXTENDED") && !e.event_ticker.includes("MULTIGAME")
    );
  },

  async getEvent(eventTicker: string): Promise<KalshiEvent> {
    const response = await fetchKalshi<KalshiEventResponse>(`/events/${eventTicker}`);
    return response.event;
  },
};

const OPINION_API_BASE = "https://proxy.opinion.trade:8443/openapi";

// Opinion API requires an API key for all endpoints, including public market data
// Set via OPINION_API_KEY environment variable or pass via request headers

// Opinion API Response Types
export interface OpinionToken {
  token_id: string;
  outcome: string; // "Yes" or "No" or outcome name
  price: number; // 0-1 decimal
  winner: boolean;
}

export interface OpinionMarket {
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
  minimum_order_size: string;
  minimum_tick_size: string;
  tokens: OpinionToken[];
  rewards: {
    min_size: string;
    max_spread: string;
    event_start_date: string;
    event_end_date: string;
  };
  icon: string;
  image: string;
  neg_risk: boolean;
  neg_risk_market_id: string;
  neg_risk_request_id: string;
  is_50_50_outcome: boolean;
  // Aggregated stats (may be present on some endpoints)
  volume?: string;
  liquidity?: string;
}

export interface OpinionEvent {
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

export interface OpinionMarketsResponse {
  data: OpinionMarket[];
  next_cursor?: string;
}

export interface OpinionEventsResponse {
  data: OpinionEvent[];
  next_cursor?: string;
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

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Opinion API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

export const opinionClient = {
  async getMarkets(params?: {
    limit?: string;
    cursor?: string;
    active?: string;
    closed?: string;
  }): Promise<OpinionMarket[]> {
    const response = await fetchOpinion<OpinionMarketsResponse>("/markets", params);
    return response.data || [];
  },

  async getMarket(conditionId: string): Promise<OpinionMarket> {
    const response = await fetchOpinion<{ data: OpinionMarket }>(
      `/markets/${conditionId}`
    );
    return response.data;
  },

  // Opinion may not have a separate events endpoint, so we group markets by category/question_id
  async getEvents(params?: {
    limit?: string;
    cursor?: string;
    active?: string;
  }): Promise<OpinionEvent[]> {
    // Fetch markets and group them into pseudo-events by question_id
    const markets = await this.getMarkets(params);

    // Group markets by question_id to create events
    const eventMap = new Map<string, OpinionEvent>();

    for (const market of markets) {
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

      // Update aggregated stats
      if (market.volume) {
        event.volume = (event.volume || 0) + parseFloat(market.volume);
      }
      if (market.liquidity) {
        event.liquidity = (event.liquidity || 0) + parseFloat(market.liquidity);
      }

      // Update event active/closed status
      event.active = event.active || market.active;
      event.closed = event.closed && market.closed;
    }

    return Array.from(eventMap.values());
  },

  async getEvent(eventId: string): Promise<OpinionEvent> {
    // Fetch the market and wrap it as an event
    const market = await this.getMarket(eventId);

    return {
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
  },

  async getOrderbook(tokenId: string): Promise<unknown> {
    return fetchOpinion<unknown>("/orderbook", { token_id: tokenId });
  },
};

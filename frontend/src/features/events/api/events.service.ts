import { apiClient } from "@/lib/api-client";
import type {
  Event,
  EventsResponse,
  EventResponse,
  ParsedEvent,
  EventOutcome,
} from "../types/event.types";
import type {
  Market,
  ParsedMarket,
  MarketOutcome,
} from "@/features/markets/types/market.types";

function parseMarketOutcomes(market: Market): ParsedMarket {
  let parsedOutcomes: MarketOutcome[] = [];

  try {
    const outcomes = JSON.parse(market.outcomes || "[]") as string[];
    const prices = JSON.parse(market.outcomePrices || "[]") as string[];

    parsedOutcomes = outcomes.map((name, index) => ({
      name,
      price: parseFloat(prices[index] || "0"),
    }));
  } catch {
    parsedOutcomes = [];
  }

  return {
    ...market,
    parsedOutcomes,
  };
}

function parseEvent(event: Event): ParsedEvent {
  const parsedMarkets = event.markets.map(parseMarketOutcomes);

  // Collect all outcomes from all markets, filtering out "No" outcomes
  const allOutcomes: EventOutcome[] = [];
  parsedMarkets.forEach((market) => {
    market.parsedOutcomes.forEach((outcome) => {
      // Skip "No" outcomes for cleaner display
      if (outcome.name.toLowerCase() === "no") return;

      allOutcomes.push({
        name: outcome.name,
        price: outcome.price,
        marketId: market.id,
      });
    });
  });

  // Sort by probability descending
  const sortedOutcomes = allOutcomes.sort((a, b) => b.price - a.price);

  return {
    ...event,
    markets: parsedMarkets,
    topOutcomes: sortedOutcomes.slice(0, 5),
    totalOutcomesCount: sortedOutcomes.length,
  };
}

export const EventsService = {
  async getEvents(params?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    order?: string;
    ascending?: boolean;
  }): Promise<ParsedEvent[]> {
    const response = await apiClient.get<EventsResponse>("/events", {
      params: {
        limit: params?.limit?.toString(),
        offset: params?.offset?.toString(),
        active: params?.active?.toString(),
        closed: params?.closed?.toString(),
        order: params?.order,
        ascending: params?.ascending?.toString(),
      },
    });

    const now = new Date();
    return response.data.data
      .map(parseEvent)
      .filter((event) => new Date(event.endDate) > now);
  },

  async getEvent(id: string): Promise<ParsedEvent> {
    const response = await apiClient.get<EventResponse>(`/events/${id}`);
    return parseEvent(response.data.data);
  },
};

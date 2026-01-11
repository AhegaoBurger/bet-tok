import { apiClient } from "@/lib/api-client";
import type { Market, MarketsResponse, MarketResponse, ParsedMarket, MarketOutcome } from "../types/market.types";

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

export const MarketsService = {
  async getMarkets(params?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    order?: string;
    ascending?: boolean;
  }): Promise<ParsedMarket[]> {
    const response = await apiClient.get<MarketsResponse>("/markets", {
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
      .map(parseMarketOutcomes)
      .filter((market) => new Date(market.endDate) > now);
  },

  async getMarket(id: string): Promise<ParsedMarket> {
    const response = await apiClient.get<MarketResponse>(`/markets/${id}`);
    return parseMarketOutcomes(response.data.data);
  },

  async searchMarkets(query: string): Promise<ParsedMarket[]> {
    const response = await apiClient.get<MarketsResponse>("/markets/search", {
      params: { q: query },
    });
    return response.data.data.map(parseMarketOutcomes);
  },
};

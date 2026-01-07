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
  }): Promise<ParsedMarket[]> {
    const response = await apiClient.get<MarketsResponse>("/markets", {
      params: {
        limit: params?.limit?.toString(),
        offset: params?.offset?.toString(),
        active: params?.active?.toString(),
      },
    });

    return response.data.data.map(parseMarketOutcomes);
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

export interface GammaMarket {
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
}
export interface GammaEvent {
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
export interface MarketsResponse {
    data: GammaMarket[];
    next_cursor?: string;
}
export interface EventsResponse {
    data: GammaEvent[];
    next_cursor?: string;
}
export declare const polymarketClient: {
    getMarkets(params?: {
        limit?: string;
        offset?: string;
        active?: string;
        closed?: string;
        order?: string;
        ascending?: string;
    }): Promise<GammaMarket[]>;
    getMarket(id: string): Promise<GammaMarket>;
    getMarketBySlug(slug: string): Promise<GammaMarket>;
    getEvents(params?: {
        limit?: string;
        offset?: string;
        active?: string;
        closed?: string;
        order?: string;
        ascending?: string;
    }): Promise<GammaEvent[]>;
    getEvent(id: string): Promise<GammaEvent>;
    searchMarkets(query: string): Promise<GammaMarket[]>;
};
//# sourceMappingURL=polymarket-client.d.ts.map
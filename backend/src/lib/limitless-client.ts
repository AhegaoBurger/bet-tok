
export interface LimitlessMarket {
    id: number;
    address: string;
    conditionId: string;
    title: string;
    description: string;
    collateralToken: {
        address: string;
        decimals: number;
        symbol: string;
    };
    prices: number[];
    volume: string;
    volumeFormatted: string;
    liquidity: string; // Sometimes returned as string in similar APIs, verifying type needed but sticking to string/number safeties
    slug: string;
    outcomes: {
        id: number;
        name: string;
        symbol: string;
    }[];
    expirationTimestamp: number;
}

export interface LimitlessMarketsResponse {
    data: LimitlessMarket[];
}

const LIMITLESS_API_BASE = "https://api.limitless.exchange/api-v1";

async function fetchLimitless<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${LIMITLESS_API_BASE}${endpoint}`);
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
        // If 404, might return null or handle gracefully upstream, but throwing here is standard
        throw new Error(`Limitless API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}

export const limitlessClient = {
    async getMarkets(params?: {
        limit?: string;
        page?: string;
        sortBy?: string;
        // Limitless specific filters if needed
    }): Promise<LimitlessMarket[]> {
        const response = await fetchLimitless<LimitlessMarketsResponse>("/markets/active", params);
        return response.data;
    },

    async getMarket(addressOrSlug: string): Promise<LimitlessMarket> {
        // The endpoint returns the market object directly or wrapped? Docs said "Returns a single market".
        // Usually these consistent APIs return the object or { data: object }. 
        // Based on the list response having { data: [...] }, the single item might be just the item or { data: item }.
        // Let's assume it returns the item directly or check if we need to unwrap.
        // The browser check said "Returns a single market ... with same fields as list items".
        // I'll assume it returns the object directly for now, or if wrapped in data, I'll adjust.
        // Actually, good practice to check result.
        const result = await fetchLimitless<LimitlessMarket | { data: LimitlessMarket }>(`/markets/${addressOrSlug}`);
        if ("data" in result && result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
            return result.data as LimitlessMarket;
        }
        return result as LimitlessMarket;
    },

    // No direct "events" endpoint that aggregates differently than markets in the simple view.
    // We will map markets to events 1:1 for now in the transforms.
};

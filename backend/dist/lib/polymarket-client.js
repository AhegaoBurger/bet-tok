const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
async function fetchGamma(endpoint, params) {
    const url = new URL(`${GAMMA_API_BASE}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value)
                url.searchParams.append(key, value);
        });
    }
    const response = await fetch(url.toString(), {
        headers: {
            Accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}
export const polymarketClient = {
    async getMarkets(params) {
        return fetchGamma("/markets", params);
    },
    async getMarket(id) {
        return fetchGamma(`/markets/${id}`);
    },
    async getMarketBySlug(slug) {
        const markets = await fetchGamma("/markets", { slug });
        if (!markets.length) {
            throw new Error(`Market not found: ${slug}`);
        }
        return markets[0];
    },
    async getEvents(params) {
        return fetchGamma("/events", params);
    },
    async getEvent(id) {
        return fetchGamma(`/events/${id}`);
    },
    async searchMarkets(query) {
        return fetchGamma("/markets", {
            _q: query,
            active: "true",
        });
    },
};
//# sourceMappingURL=polymarket-client.js.map
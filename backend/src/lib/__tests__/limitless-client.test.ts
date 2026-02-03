import { describe, it, expect, vi, beforeEach } from 'vitest';
import { limitlessClient, LimitlessMarket } from '../limitless-client.js';

// Mock the global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createMockMarket = (overrides: Partial<LimitlessMarket> = {}): LimitlessMarket => ({
    id: 7495,
    address: '0x123',
    conditionId: '0xabc',
    title: 'Will Bitcoin hit 100k?',
    description: 'Market description',
    collateralToken: {
        address: '0xusdc',
        decimals: 6,
        symbol: 'USDC',
    },
    prices: [0.55, 0.45],
    volume: '1000000',
    volumeFormatted: '1.0M',
    liquidity: '500000',
    slug: 'bitcoin-100k',
    outcomes: [
        { id: 0, name: 'Yes', symbol: 'YES' },
        { id: 1, name: 'No', symbol: 'NO' },
    ],
    expirationTimestamp: 1725192000000,
    ...overrides,
});

describe('limitlessClient', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('getMarkets', () => {
        it('should fetch markets with default parameters', async () => {
            const mockMarkets = [createMockMarket()];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: mockMarkets }),
            });

            const result = await limitlessClient.getMarkets();

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.limitless.exchange/api-v1/markets/active',
                expect.objectContaining({
                    headers: { Accept: 'application/json' },
                })
            );
            expect(result).toEqual(mockMarkets);
        });

        it('should pass query parameters correctly', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [] }),
            });

            await limitlessClient.getMarkets({ limit: '10', page: '2', sortBy: 'volume' });

            const calledUrl = mockFetch.mock.calls[0][0] as string;
            expect(calledUrl).toContain('limit=10');
            expect(calledUrl).toContain('page=2');
            expect(calledUrl).toContain('sortBy=volume');
        });

        it('should throw error on API failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            await expect(limitlessClient.getMarkets()).rejects.toThrow(
                'Limitless API error: 500 Internal Server Error'
            );
        });
    });

    describe('getMarket', () => {
        it('should fetch a single market by ID/Slug', async () => {
            const mockMarket = createMockMarket({ address: '0x123' });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockMarket),
            });

            const result = await limitlessClient.getMarket('0x123');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.limitless.exchange/api-v1/markets/0x123',
                expect.any(Object)
            );
            expect(result).toEqual(mockMarket);
        });

        // Test the unwrap logic if data wrapper is present
        it('should unwap data object if response is wrapped', async () => {
            const mockMarket = createMockMarket({ address: '0x123' });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: mockMarket }),
            });

            const result = await limitlessClient.getMarket('0x123');
            expect(result).toEqual(mockMarket);
        });
    });
});

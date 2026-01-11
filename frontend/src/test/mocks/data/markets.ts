import type { Market } from '@/features/markets/types/market.types';

export const mockMarket: Market = {
  id: 'test-market-1',
  question: 'Will Bitcoin reach $200k in 2027?',
  conditionId: 'cond-123',
  slug: 'bitcoin-200k-2027',
  resolutionSource: 'https://coinmarketcap.com',
  endDate: '2027-12-31T23:59:59Z',
  liquidity: '500000',
  startDate: '2026-01-01T00:00:00Z',
  image: 'https://example.com/btc.png',
  icon: 'https://example.com/btc-icon.png',
  description: 'Market for Bitcoin price prediction',
  outcomes: '["Yes","No"]',
  outcomePrices: '["0.65","0.35"]',
  volume: '1500000',
  active: true,
  closed: false,
  marketMakerAddress: '0x123abc',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-01T12:00:00Z',
  new: false,
  featured: true,
  submitted_by: 'admin',
  category: 'crypto',
  volume24hr: '50000',
};

export const mockMarkets: Market[] = [
  mockMarket,
  {
    ...mockMarket,
    id: 'test-market-2',
    question: 'Will Ethereum flip Bitcoin in 2027?',
    slug: 'eth-flip-btc-2027',
    outcomePrices: '["0.15","0.85"]',
  },
  {
    ...mockMarket,
    id: 'test-market-3',
    question: 'Will there be a US recession in 2027?',
    slug: 'us-recession-2027',
    category: 'economics',
    outcomePrices: '["0.30","0.70"]',
  },
];

export const mockExpiredMarket: Market = {
  ...mockMarket,
  id: 'expired-market-1',
  question: 'Will Bitcoin reach $100k in 2024?',
  slug: 'bitcoin-100k-2024',
  endDate: '2024-12-31T23:59:59Z',
  startDate: '2024-01-01T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  active: true,
  closed: false,
};

export const mockMalformedMarket: Market = {
  ...mockMarket,
  id: 'malformed-market',
  outcomes: 'not-valid-json',
  outcomePrices: 'also-not-valid',
};

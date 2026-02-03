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
  platform: 'polymarket',
  platformUrl: 'https://polymarket.com/market/bitcoin-200k-2027',
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

// Multi-outcome market mock (e.g., for presidential elections, Fed decisions)
export const mockMultiOutcomeMarkets: Market[] = [
  {
    ...mockMarket,
    id: 'multi-outcome-1',
    question: 'Will Donald Trump win the 2028 US Presidential Election?',
    slug: 'trump-2028',
    outcomes: '["Yes","No"]',
    outcomePrices: '["0.45","0.55"]',
    groupItemTitle: 'Donald Trump',
    negRisk: true,
  },
  {
    ...mockMarket,
    id: 'multi-outcome-2',
    question: 'Will Kamala Harris win the 2028 US Presidential Election?',
    slug: 'harris-2028',
    outcomes: '["Yes","No"]',
    outcomePrices: '["0.35","0.65"]',
    groupItemTitle: 'Kamala Harris',
    negRisk: true,
  },
  {
    ...mockMarket,
    id: 'multi-outcome-3',
    question: 'Will Ron DeSantis win the 2028 US Presidential Election?',
    slug: 'desantis-2028',
    outcomes: '["Yes","No"]',
    outcomePrices: '["0.15","0.85"]',
    groupItemTitle: 'Ron DeSantis',
    negRisk: true,
  },
];

// Kalshi mock market
export const mockKalshiMarket: Market = {
  id: 'KXELONMARS-99',
  ticker: 'KXELONMARS-99',
  question: 'Will Elon Musk visit Mars before Aug 1, 2099?',
  slug: 'kxelonmars-99',
  resolutionSource: 'https://kalshi.com',
  endDate: '2099-08-01T04:59:00Z',
  liquidity: '56430',
  startDate: '2025-08-28T20:45:00Z',
  image: '',
  icon: '',
  description: 'If Elon Musk visits Mars before the earlier of his death or Aug 1, 2099, then the market resolves to Yes.',
  outcomes: '["Yes","No"]',
  outcomePrices: '["0.07","0.93"]',
  volume: '36862',
  active: true,
  closed: false,
  createdAt: '2025-08-28T20:45:00Z',
  updatedAt: '2025-08-28T20:45:00Z',
  new: false,
  featured: false,
  category: 'World',
  volume24hr: '214',
  platform: 'kalshi',
  platformUrl: 'https://kalshi.com/markets/KXELONMARS-99',
};

export const mockKalshiMarkets: Market[] = [
  mockKalshiMarket,
  {
    ...mockKalshiMarket,
    id: 'KXWARMING-50',
    ticker: 'KXWARMING-50',
    question: 'Will the world pass 2 degrees Celsius over pre-industrial levels before 2050?',
    slug: 'kxwarming-50',
    category: 'Climate and Weather',
    outcomePrices: '["0.25","0.75"]',
    platformUrl: 'https://kalshi.com/markets/KXWARMING-50',
  },
];

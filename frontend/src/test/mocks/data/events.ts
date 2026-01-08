import type { Event } from "@/features/events/types/event.types";
import { mockMarket, mockMarkets } from "./markets";

export const mockEvent: Event = {
  id: "test-event-1",
  title: "US Presidential Election 2024",
  slug: "us-presidential-election-2024",
  description: "Prediction markets for the 2024 US Presidential Election",
  startDate: "2024-01-01T00:00:00Z",
  creationDate: "2024-01-01T00:00:00Z",
  endDate: "2024-11-05T23:59:59Z",
  image: "https://example.com/election.png",
  icon: "https://example.com/election-icon.png",
  active: true,
  closed: false,
  archived: false,
  new: false,
  featured: true,
  restricted: false,
  liquidity: 5000000,
  volume: 15000000,
  markets: mockMarkets,
};

export const mockEvents: Event[] = [
  mockEvent,
  {
    ...mockEvent,
    id: "test-event-2",
    title: "Bitcoin Price Predictions 2024",
    slug: "bitcoin-price-2024",
    volume: 8000000,
    liquidity: 2000000,
    markets: [mockMarket],
  },
  {
    ...mockEvent,
    id: "test-event-3",
    title: "Super Bowl Champion 2025",
    slug: "super-bowl-2025",
    volume: 3000000,
    liquidity: 1000000,
    featured: false,
    markets: mockMarkets.slice(0, 2),
  },
];

export const mockMalformedEvent: Event = {
  ...mockEvent,
  id: "malformed-event",
  markets: [
    {
      ...mockMarket,
      outcomes: "not-valid-json",
      outcomePrices: "also-not-valid",
    },
  ],
};

export type Platform = "polymarket" | "kalshi" | "opinion";

export const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    color: { bg: string; text: string };
    chain?: { id: number; name: string };
  }
> = {
  polymarket: {
    label: "Polymarket",
    color: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-800 dark:text-purple-200",
    },
    chain: { id: 137, name: "Polygon" },
  },
  kalshi: {
    label: "Kalshi",
    color: {
      bg: "bg-orange-100 dark:bg-orange-900",
      text: "text-orange-800 dark:text-orange-200",
    },
  },
  opinion: {
    label: "Opinion",
    color: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-800 dark:text-green-200",
    },
    chain: { id: 56, name: "BNB Chain" },
  },
};

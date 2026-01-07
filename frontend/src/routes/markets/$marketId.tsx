import { createFileRoute } from "@tanstack/react-router";
import { MarketDetailPage } from "@/features/markets/pages/MarketDetailPage";

export const Route = createFileRoute("/markets/$marketId")({
  component: MarketDetailPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { MarketsPage } from "@/features/markets/pages/MarketsPage";

export const Route = createFileRoute("/markets/")({
  component: MarketsPage,
});

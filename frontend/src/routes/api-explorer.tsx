import { createFileRoute } from "@tanstack/react-router";
import { ApiExplorerPage } from "@/features/api-explorer/pages/ApiExplorerPage";

export const Route = createFileRoute("/api-explorer")({
  component: ApiExplorerPage,
});

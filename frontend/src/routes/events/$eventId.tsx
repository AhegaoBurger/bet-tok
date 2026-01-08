import { createFileRoute } from "@tanstack/react-router";
import { EventDetailPage } from "@/features/events/pages/EventDetailPage";

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailPage,
});

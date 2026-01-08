import { useState } from "react";
import { useInfiniteEvents } from "../api/events.queries";
import { EventList } from "../components/EventList";
import { EventSortDropdown } from "../components/EventSortDropdown";
import { LoadMoreButton } from "../components/LoadMoreButton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DEFAULT_EVENT_SORT, type EventSortOption } from "../types/event.types";

export function EventsPage() {
  const [sortOption, setSortOption] = useState<EventSortOption>(DEFAULT_EVENT_SORT);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteEvents({
    pageSize: 20,
    active: true,
    order: sortOption.value,
    ascending: sortOption.ascending,
  });

  const events = data?.pages.flat() ?? [];

  const handleSortChange = (option: EventSortOption) => {
    setSortOption(option);
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Browse prediction market events
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <EventSortDropdown value={sortOption} onChange={handleSortChange} />

        {!isLoading && events.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {events.length} events
          </p>
        )}
      </div>

      {/* Event list */}
      <EventList events={events} isLoading={isLoading} />

      {/* Load More button */}
      {!isLoading && events.length > 0 && (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
        />
      )}
    </div>
  );
}

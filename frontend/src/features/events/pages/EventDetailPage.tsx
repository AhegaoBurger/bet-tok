import { useParams, Link } from "@tanstack/react-router";
import { useEvent } from "../api/events.queries";
import { MarketCard } from "@/features/markets/components/MarketCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowLeft, Calendar, DollarSign, Droplets } from "lucide-react";

export function EventDetailPage() {
  const { eventId } = useParams({ from: "/events/$eventId" });
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link to="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const endDate = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <Link to="/events">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        {event.image && (
          <img
            src={event.image}
            alt=""
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold">{event.title}</h1>
          <div className="flex flex-wrap gap-2">
            {event.active && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            )}
            {event.closed && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Closed
              </span>
            )}
            {event.featured && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Volume</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(event.volume)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplets className="h-4 w-4" />
              <span className="text-sm">Liquidity</span>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(event.liquidity)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">End Date</span>
            </div>
            <p className="text-2xl font-bold">
              {endDate ? endDate.toLocaleDateString() : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Outcomes Summary */}
      {event.topOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {event.topOutcomes.map((outcome, index) => (
                <div
                  key={`${outcome.marketId}-${outcome.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium truncate mr-2">
                    {outcome.name}
                  </span>
                  <span className="text-primary font-bold">
                    {formatPercentage(outcome.price)}
                  </span>
                </div>
              ))}
            </div>
            {event.totalOutcomesCount > 5 && (
              <p className="text-sm text-muted-foreground mt-3">
                +{event.totalOutcomesCount - 5} more outcomes in markets below
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>About this Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Markets in this event */}
      {event.markets.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Markets ({event.markets.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-start gap-4">
        <Skeleton className="w-24 h-24 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-6 w-32" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { ParsedEvent } from "../types/event.types";

interface EventCardProps {
  event: ParsedEvent;
  maxOutcomes?: number;
}

export function EventCard({ event, maxOutcomes = 4 }: EventCardProps) {
  const displayedOutcomes = event.topOutcomes.slice(0, maxOutcomes);
  const remainingCount = Math.max(0, event.totalOutcomesCount - maxOutcomes);

  return (
    <Link to="/events/$eventId" params={{ eventId: event.id }}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {event.image && (
              <img
                src={event.image}
                alt=""
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium leading-tight line-clamp-2">
                {event.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(event.volume)} Vol
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Top Outcomes */}
          {displayedOutcomes.length > 0 && (
            <div className="space-y-2">
              {displayedOutcomes.map((outcome, index) => (
                <div
                  key={`${outcome.marketId}-${outcome.name}-${index}`}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate mr-2 flex-1">
                      {outcome.name}
                    </span>
                    <span className="font-medium text-primary flex-shrink-0">
                      {formatPercentage(outcome.price)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 transition-all"
                      style={{ width: `${outcome.price * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* More outcomes indicator */}
          {remainingCount > 0 && (
            <p className="text-xs text-muted-foreground">
              +{remainingCount} more outcome{remainingCount > 1 ? "s" : ""}
            </p>
          )}

          {/* Status badges */}
          <div className="flex gap-2 pt-2 border-t">
            {event.active && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            )}
            {event.featured && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Featured
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {event.markets.length} market{event.markets.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

import { useParams, Link } from "@tanstack/react-router";
import { useMarket } from "../api/markets.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Calendar, DollarSign, Droplets } from "lucide-react";

export function MarketDetailPage() {
  const { marketId } = useParams({ from: "/markets/$marketId" });
  const { data: market, isLoading, error } = useMarket(marketId);

  if (isLoading) {
    return <MarketDetailSkeleton />;
  }

  if (error || !market) {
    return (
      <div className="space-y-4">
        <Link to="/markets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Market not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const endDate = market.endDate ? new Date(market.endDate) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/markets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Markets
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        {market.image && (
          <img
            src={market.image}
            alt=""
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold">{market.question}</h1>
          <div className="flex flex-wrap gap-2">
            {market.active && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            )}
            {market.closed && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Closed
              </span>
            )}
            {market.category && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {market.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle>Outcomes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {market.parsedOutcomes.map((outcome) => (
            <div key={outcome.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{outcome.name}</span>
                <span className="text-lg font-bold">
                  {formatPercentage(outcome.price)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${outcome.price * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Volume</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(market.volume)}</p>
            {market.volume24hr && (
              <p className="text-sm text-muted-foreground">
                24h: {formatCurrency(market.volume24hr)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplets className="h-4 w-4" />
              <span className="text-sm">Liquidity</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(market.liquidity)}</p>
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

      {/* Description */}
      {market.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {market.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resolution Source */}
      {market.resolutionSource && (
        <Card>
          <CardHeader>
            <CardTitle>Resolution Source</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={market.resolutionSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {market.resolutionSource}
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MarketDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { ParsedMarket } from "../types/market.types";

interface MarketCardProps {
  market: ParsedMarket;
}

export function MarketCard({ market }: MarketCardProps) {
  return (
    <Link to="/markets/$marketId" params={{ marketId: market.id }}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {market.image && (
              <img
                src={market.image}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <CardTitle className="text-base font-medium leading-tight line-clamp-2">
              {market.question}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Outcomes */}
          <div className="space-y-2">
            {market.parsedOutcomes.slice(0, 2).map((outcome) => (
              <div
                key={outcome.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground truncate mr-2">
                  {outcome.name}
                </span>
                <span className="font-medium">
                  {formatPercentage(outcome.price)}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Vol: {formatCurrency(market.volume)}</span>
            <span>Liq: {formatCurrency(market.liquidity)}</span>
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            {market.active && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            )}
            {market.featured && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Featured
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

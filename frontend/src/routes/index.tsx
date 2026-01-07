import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 lg:py-20">
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Explore Prediction Markets
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Real-time market data from Polymarket. Track predictions, analyze trends,
          and stay informed on world events.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/markets">
            <Button size="lg">
              Browse Markets
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <TrendingUp className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Live Prices</CardTitle>
            <CardDescription>
              Real-time probability data from active prediction markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track market movements as they happen with up-to-date pricing information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Market Analytics</CardTitle>
            <CardDescription>
              Volume, liquidity, and trading activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Understand market depth and activity with comprehensive analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Fast & Responsive</CardTitle>
            <CardDescription>
              Optimized for all devices with mobile-first design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access market data anywhere with a responsive interface.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

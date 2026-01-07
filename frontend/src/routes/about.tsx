import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl lg:text-4xl font-bold">About bet-tok</h1>
        <p className="text-lg text-muted-foreground">
          A simple interface for exploring Polymarket prediction markets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What is Polymarket?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Polymarket is a decentralized prediction market platform where users can
            trade on the outcomes of real-world events. Markets cover topics like
            politics, sports, crypto, and current events.
          </p>
          <p>
            Prices represent the market's estimated probability of an outcome.
            A market trading at $0.75 suggests a 75% chance of that outcome occurring.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About This App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            bet-tok provides a read-only view of Polymarket data via the
            Gamma API. It's designed as a simple, fast way to browse and
            explore prediction markets.
          </p>
          <p className="text-sm text-muted-foreground">
            This is an MVP demo application. It does not support trading or
            wallet connections.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>React 19 + TypeScript</li>
            <li>TanStack Router (file-based routing)</li>
            <li>TanStack Query (server state)</li>
            <li>Tailwind CSS v4</li>
            <li>HonoJS (backend proxy)</li>
            <li>Polymarket Gamma API</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

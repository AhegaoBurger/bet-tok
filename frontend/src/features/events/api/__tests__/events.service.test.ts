import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { EventsService } from "../events.service";
import { server } from "@/test/mocks/server";
import { mockMalformedEvent, mockExpiredEvent, mockEvent, mockMultiOutcomeEvent } from "@/test/mocks/data/events";

describe("EventsService", () => {
  describe("getEvents", () => {
    it("should fetch and parse events", async () => {
      const events = await EventsService.getEvents({ limit: 10 });

      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);

      // Verify parsing occurred
      const event = events[0];
      expect(event).toHaveProperty("topOutcomes");
      expect(event).toHaveProperty("totalOutcomesCount");
      expect(event).toHaveProperty("markets");
      expect(Array.isArray(event.markets)).toBe(true);
    });

    it("should correctly parse nested market outcomes", async () => {
      const events = await EventsService.getEvents();
      const event = events[0];

      // Markets should have parsed outcomes
      expect(event.markets[0]).toHaveProperty("parsedOutcomes");
      expect(Array.isArray(event.markets[0].parsedOutcomes)).toBe(true);
    });

    it("should aggregate top outcomes from markets", async () => {
      const events = await EventsService.getEvents();
      const event = events[0];

      // Should have top outcomes aggregated
      expect(event.topOutcomes.length).toBeLessThanOrEqual(5);
      if (event.topOutcomes.length > 0) {
        expect(event.topOutcomes[0]).toHaveProperty("name");
        expect(event.topOutcomes[0]).toHaveProperty("price");
        expect(event.topOutcomes[0]).toHaveProperty("marketId");
      }
    });

    it("should filter out 'No' outcomes from topOutcomes", async () => {
      const events = await EventsService.getEvents();
      const event = events[0];

      const hasNoOutcome = event.topOutcomes.some(
        (o) => o.name.toLowerCase() === "no"
      );
      expect(hasNoOutcome).toBe(false);
    });

    it("should pass parameters correctly", async () => {
      const events = await EventsService.getEvents({
        limit: 2,
        offset: 0,
        active: true,
      });

      expect(events.length).toBeLessThanOrEqual(2);
    });

    it("should handle malformed market outcomes gracefully", async () => {
      server.use(
        http.get("/api/events", () => {
          return HttpResponse.json({
            data: [mockMalformedEvent],
          });
        })
      );

      const events = await EventsService.getEvents();
      expect(events[0].markets[0].parsedOutcomes).toEqual([]);
    });

    it("should handle empty events response", async () => {
      server.use(
        http.get("/api/events", () => {
          return HttpResponse.json({ data: [] });
        })
      );

      const events = await EventsService.getEvents();
      expect(events).toEqual([]);
    });

    it("should handle API errors", async () => {
      server.use(
        http.get("/api/events", () => {
          return HttpResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        })
      );

      await expect(EventsService.getEvents()).rejects.toThrow();
    });

    it("should filter out events with past endDate", async () => {
      server.use(
        http.get("/api/events", () => {
          return HttpResponse.json({
            data: [mockEvent, mockExpiredEvent],
          });
        })
      );

      const events = await EventsService.getEvents();

      // Should only include future events
      expect(events.length).toBe(1);
      expect(events[0].id).toBe(mockEvent.id);

      // Should not include expired event
      const expiredEvent = events.find(e => e.id === mockExpiredEvent.id);
      expect(expiredEvent).toBeUndefined();
    });

    it("should pass closed parameter to API", async () => {
      let capturedClosed: string | null = null;

      server.use(
        http.get("/api/events", ({ request }) => {
          const url = new URL(request.url);
          capturedClosed = url.searchParams.get("closed");
          return HttpResponse.json({ data: [] });
        })
      );

      await EventsService.getEvents({ closed: false });

      expect(capturedClosed).toBe("false");
    });

    it("should use groupItemTitle for multi-outcome event names", async () => {
      server.use(
        http.get("/api/events", () => {
          return HttpResponse.json({
            data: [mockMultiOutcomeEvent],
          });
        })
      );

      const events = await EventsService.getEvents();
      const event = events[0];

      // Should use groupItemTitle as outcome name instead of "Yes"
      const outcomeNames = event.topOutcomes.map((o) => o.name);
      expect(outcomeNames).toContain("Donald Trump");
      expect(outcomeNames).toContain("Kamala Harris");
      expect(outcomeNames).toContain("Ron DeSantis");

      // Should NOT contain "Yes" as an outcome name
      expect(outcomeNames).not.toContain("Yes");
    });

    it("should sort multi-outcome events by probability descending", async () => {
      server.use(
        http.get("/api/events", () => {
          return HttpResponse.json({
            data: [mockMultiOutcomeEvent],
          });
        })
      );

      const events = await EventsService.getEvents();
      const event = events[0];

      // Verify sorting: Trump (0.45) > Harris (0.35) > DeSantis (0.15)
      expect(event.topOutcomes[0].name).toBe("Donald Trump");
      expect(event.topOutcomes[0].price).toBe(0.45);
      expect(event.topOutcomes[1].name).toBe("Kamala Harris");
      expect(event.topOutcomes[1].price).toBe(0.35);
      expect(event.topOutcomes[2].name).toBe("Ron DeSantis");
      expect(event.topOutcomes[2].price).toBe(0.15);
    });
  });

  describe("getEvent", () => {
    it("should fetch a single event by ID", async () => {
      const event = await EventsService.getEvent("test-123");

      expect(event.id).toBe("test-123");
      expect(event).toHaveProperty("topOutcomes");
      expect(event).toHaveProperty("markets");
    });

    it("should parse the event markets and outcomes", async () => {
      const event = await EventsService.getEvent("test-id");

      expect(event.markets.length).toBeGreaterThan(0);
      expect(event.markets[0]).toHaveProperty("parsedOutcomes");
    });

    it("should handle 404 errors", async () => {
      server.use(
        http.get("/api/events/:id", () => {
          return HttpResponse.json({ error: "Not found" }, { status: 404 });
        })
      );

      await expect(EventsService.getEvent("nonexistent")).rejects.toThrow();
    });
  });
});

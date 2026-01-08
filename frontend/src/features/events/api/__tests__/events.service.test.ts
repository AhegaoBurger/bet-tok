import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { EventsService } from "../events.service";
import { server } from "@/test/mocks/server";
import { mockMalformedEvent } from "@/test/mocks/data/events";

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

import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInfiniteEvents, useEvent, eventKeys } from "../events.queries";
import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("eventKeys", () => {
  it("should generate all key", () => {
    expect(eventKeys.all).toEqual(["events"]);
  });

  it("should generate lists key", () => {
    expect(eventKeys.lists()).toEqual(["events", "list"]);
  });

  it("should generate list key with filters", () => {
    expect(eventKeys.list({ limit: 10 })).toEqual([
      "events",
      "list",
      { limit: 10 },
    ]);
    expect(eventKeys.list({ limit: 20, offset: 5, active: true })).toEqual([
      "events",
      "list",
      { limit: 20, offset: 5, active: true },
    ]);
  });

  it("should generate infinite key with filters", () => {
    expect(eventKeys.infinite({ order: "volume", ascending: false })).toEqual([
      "events",
      "infinite",
      { order: "volume", ascending: false },
    ]);
  });

  it("should generate details key", () => {
    expect(eventKeys.details()).toEqual(["events", "detail"]);
  });

  it("should generate detail key with id", () => {
    expect(eventKeys.detail("123")).toEqual(["events", "detail", "123"]);
    expect(eventKeys.detail("abc-def")).toEqual(["events", "detail", "abc-def"]);
  });
});

describe("useInfiniteEvents", () => {
  it("should fetch events", async () => {
    const { result } = renderHook(() => useInfiniteEvents(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages).toBeDefined();
    expect(Array.isArray(result.current.data?.pages[0])).toBe(true);
  });

  it("should respect enabled option", () => {
    const { result } = renderHook(() => useInfiniteEvents({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("should use default options", async () => {
    const { result } = renderHook(() => useInfiniteEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Default pageSize is 20, active is true, order is volume
    expect(result.current.data).toBeDefined();
  });

  it("should accept custom options", async () => {
    const { result } = renderHook(
      () =>
        useInfiniteEvents({
          pageSize: 5,
          active: true,
          order: "liquidity",
          ascending: true,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it("should have fetchNextPage function", async () => {
    const { result } = renderHook(() => useInfiniteEvents(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(typeof result.current.fetchNextPage).toBe("function");
  });
});

describe("useEvent", () => {
  it("should fetch a single event", async () => {
    const { result } = renderHook(() => useEvent("test-id"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.id).toBe("test-id");
  });

  it("should not fetch when id is empty", () => {
    const { result } = renderHook(() => useEvent(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("should not fetch when enabled is false", () => {
    const { result } = renderHook(() => useEvent("some-id", false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("should fetch when id is provided and enabled is true", async () => {
    const { result } = renderHook(() => useEvent("event-123", true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("topOutcomes");
    expect(result.current.data).toHaveProperty("markets");
  });
});

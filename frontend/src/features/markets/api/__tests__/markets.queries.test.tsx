import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMarkets, useMarket, useSearchMarkets, marketKeys } from '../markets.queries';
import type { ReactNode } from 'react';

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
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('marketKeys', () => {
  it('should generate all key', () => {
    expect(marketKeys.all).toEqual(['markets']);
  });

  it('should generate lists key', () => {
    expect(marketKeys.lists()).toEqual(['markets', 'list']);
  });

  it('should generate list key with filters', () => {
    expect(marketKeys.list({ limit: 10 })).toEqual(['markets', 'list', { limit: 10 }]);
    expect(marketKeys.list({ limit: 20, offset: 5, active: true })).toEqual([
      'markets',
      'list',
      { limit: 20, offset: 5, active: true },
    ]);
  });

  it('should generate details key', () => {
    expect(marketKeys.details()).toEqual(['markets', 'detail']);
  });

  it('should generate detail key with id', () => {
    expect(marketKeys.detail('123')).toEqual(['markets', 'detail', '123']);
    expect(marketKeys.detail('abc-def')).toEqual(['markets', 'detail', 'abc-def']);
  });

  it('should generate search key with query', () => {
    expect(marketKeys.search('test')).toEqual(['markets', 'search', 'test']);
    expect(marketKeys.search('bitcoin price')).toEqual(['markets', 'search', 'bitcoin price']);
  });
});

describe('useMarkets', () => {
  it('should fetch markets', async () => {
    const { result } = renderHook(() => useMarkets(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it('should respect enabled option', () => {
    const { result } = renderHook(() => useMarkets({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('should use default options', async () => {
    const { result } = renderHook(() => useMarkets(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Default limit is 20, active is true
    expect(result.current.data).toBeDefined();
  });

  it('should accept custom options', async () => {
    const { result } = renderHook(
      () => useMarkets({ limit: 5, offset: 10, active: false }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useMarket', () => {
  it('should fetch a single market', async () => {
    const { result } = renderHook(() => useMarket('test-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.id).toBe('test-id');
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useMarket(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(() => useMarket('some-id', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch when id is provided and enabled is true', async () => {
    const { result } = renderHook(() => useMarket('market-123', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});

describe('useSearchMarkets', () => {
  it('should not search when query is too short (< 2 chars)', () => {
    const { result } = renderHook(() => useSearchMarkets('a'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('should not search when query is empty', () => {
    const { result } = renderHook(() => useSearchMarkets(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should search when query is long enough (>= 2 chars)', async () => {
    const { result } = renderHook(() => useSearchMarkets('bi'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should respect enabled flag', () => {
    const { result } = renderHook(() => useSearchMarkets('bitcoin', false), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should search with longer query', async () => {
    const { result } = renderHook(() => useSearchMarkets('bitcoin'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(Array.isArray(result.current.data)).toBe(true);
  });
});

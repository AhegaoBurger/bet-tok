import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsDesktop, useIsMobile, useIsTablet, BREAKPOINTS } from '../useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));

    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return initial match state', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: '(min-width: 1024px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(true);
  });

  it('should return false when not matching', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(false);
  });

  it('should update when media query changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    addEventListenerMock.mockImplementation((_, handler) => {
      changeHandler = handler;
    });

    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(false);

    act(() => {
      changeHandler!({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup listener on unmount', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should add change event listener', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('BREAKPOINTS', () => {
  it('should have correct breakpoint values', () => {
    expect(BREAKPOINTS.sm).toBe('(min-width: 640px)');
    expect(BREAKPOINTS.md).toBe('(min-width: 768px)');
    expect(BREAKPOINTS.lg).toBe('(min-width: 1024px)');
    expect(BREAKPOINTS.xl).toBe('(min-width: 1280px)');
    expect(BREAKPOINTS['2xl']).toBe('(min-width: 1536px)');
  });
});

describe('useIsDesktop', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should use lg breakpoint', () => {
    renderHook(() => useIsDesktop());

    expect(matchMediaMock).toHaveBeenCalledWith(BREAKPOINTS.lg);
  });

  it('should return true when desktop', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(true);
  });

  it('should return false when not desktop', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(false);
  });
});

describe('useIsMobile', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return true when not desktop (mobile)', () => {
    matchMediaMock.mockReturnValue({
      matches: false, // lg doesn't match = mobile
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false when desktop', () => {
    matchMediaMock.mockReturnValue({
      matches: true, // lg matches = desktop, not mobile
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn();
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return true when md matches but lg does not (tablet)', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === BREAKPOINTS.md, // md matches, lg doesn't
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(true);
  });

  it('should return false when both md and lg match (desktop)', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(false);
  });

  it('should return false when neither md nor lg match (mobile)', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(false);
  });
});

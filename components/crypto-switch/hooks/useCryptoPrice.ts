import { useCallback, useEffect, useRef, useState } from "react";
import type {
  UseCryptoPriceOptions,
  UseCryptoPriceResult,
} from "../constants/types";
import { fetchCoinGeckoPrice } from "../providers/coingecko";

const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

interface CacheEntry {
  priceUsd: number;
  fetchedAt: number;
}

const priceCache = new Map<string, CacheEntry>();

export function useCryptoPrice(
  symbol: string,
  options: UseCryptoPriceOptions = {}
): UseCryptoPriceResult {
  const {
    fetcher = fetchCoinGeckoPrice,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    enabled = true,
  } = options;

  const cacheKey = symbol.toLowerCase();
  const [priceUsd, setPriceUsd] = useState<number | null>(
    () => priceCache.get(cacheKey)?.priceUsd ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const activeRequestId = useRef(0);

  const [trackedCacheKey, setTrackedCacheKey] = useState(cacheKey);
  if (trackedCacheKey !== cacheKey) {
    setTrackedCacheKey(cacheKey);
    const cached = priceCache.get(cacheKey);
    if (cached) {
      setPriceUsd(cached.priceUsd);
    }
    setError(null);
  }

  const load = useCallback(
    async (forceRefresh: boolean) => {
      if (!enabled) return;

      const cached = priceCache.get(cacheKey);
      const isCacheFresh =
        !!cached && Date.now() - cached.fetchedAt < cacheTtlMs;

      if (isCacheFresh && !forceRefresh) {
        setPriceUsd(cached.priceUsd);
        return;
      }

      const requestId = ++activeRequestId.current;
      setIsLoading(true);
      setError(null);

      try {
        const nextPrice = await fetcher(symbol);
        if (requestId !== activeRequestId.current) return;

        priceCache.set(cacheKey, {
          priceUsd: nextPrice,
          fetchedAt: Date.now(),
        });
        setPriceUsd(nextPrice);
      } catch (caughtError) {
        if (requestId !== activeRequestId.current) return;
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to fetch crypto price")
        );
      } finally {
        if (requestId === activeRequestId.current) setIsLoading(false);
      }
    },
    [symbol, enabled, cacheTtlMs, fetcher, cacheKey]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { priceUsd, isLoading, error, refresh };
}

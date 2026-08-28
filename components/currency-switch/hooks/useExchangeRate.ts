import { useCallback, useEffect, useRef, useState } from "react";
import type {
  UseExchangeRateOptions,
  UseExchangeRateResult,
} from "../constants/types";
import { fetchFrankfurterRate } from "../providers/frankfurter";

const DEFAULT_CACHE_TTL_MS = 15 * 60 * 1000;

interface CacheEntry {
  rate: number;
  fetchedAt: number;
}

const rateCache = new Map<string, CacheEntry>();

export function useExchangeRate(
  base: string,
  target: string,
  options: UseExchangeRateOptions = {}
): UseExchangeRateResult {
  const {
    fetcher = fetchFrankfurterRate,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    enabled = true,
  } = options;

  const cacheKey = `${base}_${target}`;
  const [rate, setRate] = useState<number | null>(
    () => rateCache.get(cacheKey)?.rate ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const activeRequestId = useRef(0);
  const lastCacheKey = useRef(cacheKey);


  useEffect(() => {
    if (lastCacheKey.current === cacheKey) return;
    lastCacheKey.current = cacheKey;
    setRate(rateCache.get(cacheKey)?.rate ?? null);
    setError(null);
  }, [cacheKey]);

  const load = useCallback(
    async (forceRefresh: boolean) => {
      if (!enabled) return;

      if (base === target) {
        setRate(1);
        setError(null);
        return;
      }

      const cached = rateCache.get(cacheKey);
      const isCacheFresh = !!cached && Date.now() - cached.fetchedAt < cacheTtlMs;

      if (isCacheFresh && !forceRefresh) {
        setRate(cached.rate);
        return;
      }

      const requestId = ++activeRequestId.current;
      setIsLoading(true);
      setError(null);

      try {
        const nextRate = await fetcher(base, target);
        if (requestId !== activeRequestId.current) return;

        rateCache.set(cacheKey, { rate: nextRate, fetchedAt: Date.now() });
        setRate(nextRate);
      } catch (caughtError) {
        if (requestId !== activeRequestId.current) return;
        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error("Failed to fetch exchange rate")
        );
      } finally {
        if (requestId === activeRequestId.current) setIsLoading(false);
      }
    },
    [base, target, enabled, cacheTtlMs, fetcher, cacheKey]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { rate, isLoading, error, refresh };
}
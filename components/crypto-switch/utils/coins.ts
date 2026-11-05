import type { Coin } from "../constants/types";

export function findCoinBySymbol(
  coins: readonly Coin[],
  symbol: string
): Coin | undefined {
  const match = coins.find(
    (coin) => coin.symbol.toLowerCase() === symbol.toLowerCase()
  );

  if (!match && typeof __DEV__ !== "undefined" && __DEV__) {
    console.warn(
      `CryptoSwitch: no coin found for symbol "${symbol}". ` +
        `Pass a matching "coins" list, or set "defaultFromCoin"/"defaultToCoin" explicitly.`
    );
  }

  return match;
}

export function lookupPriceOverride(
  prices: Readonly<Record<string, number>> | undefined,
  symbol: string
): number | undefined {
  if (!prices) return undefined;
  return (
    prices[symbol] ?? prices[symbol.toUpperCase()] ?? prices[symbol.toLowerCase()]
  );
}

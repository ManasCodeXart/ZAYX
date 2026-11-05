import { COINS } from "../constants/coins";
import type { CryptoPriceFetcher } from "../constants/types";

const COINGECKO_SIMPLE_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price";

function resolveCoingeckoId(symbol: string): string {
  const match = COINS.find(
    (coin) => coin.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return match ? match.coingeckoId : symbol.toLowerCase();
}

export const fetchCoinGeckoPrice: CryptoPriceFetcher = async (symbol) => {
  const coingeckoId = resolveCoingeckoId(symbol);
  const url = `${COINGECKO_SIMPLE_PRICE_URL}?ids=${encodeURIComponent(
    coingeckoId
  )}&vs_currencies=usd`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinGecko request failed (${response.status})`);
  }

  const data = await response.json();
  const priceUsd = data?.[coingeckoId]?.usd;

  if (typeof priceUsd !== "number") {
    throw new Error(`CoinGecko returned no USD price for ${symbol}`);
  }

  return priceUsd;
};

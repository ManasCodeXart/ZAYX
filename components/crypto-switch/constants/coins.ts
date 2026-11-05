import type { Coin } from "./types";

export type { Coin };

export const COINS: readonly Coin[] = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { symbol: "HYPE", name: "Hyperliquid", coingeckoId: "hyperliquid" },
  { symbol: "ZEC", name: "Zcash", coingeckoId: "zcash" },
  { symbol: "QNT", name: "Quant", coingeckoId: "quant-network" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
  { symbol: "DOGE", name: "Dogecoin", coingeckoId: "dogecoin" },
];

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { ThemeName } from "./theme";

export interface Coin {
  readonly symbol: string;
  readonly name: string;
  readonly coingeckoId: string;
}

export type PickerTarget = "from" | "to";

export interface CardBounds {
  readonly topHeight: number;
  readonly bottomHeight: number;
  readonly unionHeight: number;
}

export interface QuoteVeil {
  readonly sendAmount: string;
  readonly receiveAmount: string;
  readonly payUsd: string;
  readonly receiveUsd: string;
}

export interface CoinPickerProps {
  target: PickerTarget;
  title: string;
  bounds: CardBounds;
  selectedSymbol: string;
  coins: readonly Coin[];
  swapIcon?: ReactNode;
  veil: QuoteVeil;
  themeProgress: SharedValue<number>;
  onSelect: (coin: Coin) => void;
  onClose: () => void;
}

export interface CryptoSwitchProps {
  coins?: readonly Coin[];
  defaultFromCoin?: Coin;
  defaultToCoin?: Coin;
  defaultSendAmount?: string;
  spread?: number;
  prices?: Readonly<Record<string, number>>;
  swapIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  theme?: ThemeName;
  onAmountChange?: (amount: string) => void;
  onCoinChange?: (from: Coin, to: Coin) => void;
  onSend?: (details: { amount: number; from: Coin; to: Coin }) => void;
  onThemeChange?: (theme: ThemeName) => void;
}

export type CryptoPriceFetcher = (symbol: string) => Promise<number>;

export interface UseCryptoPriceOptions {
  fetcher?: CryptoPriceFetcher;
  cacheTtlMs?: number;
  enabled?: boolean;
}

export interface UseCryptoPriceResult {
  priceUsd: number | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

// constants/types.ts

import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export interface Currency {
  readonly code: string;
  readonly symbol: string;
  readonly name: string;
  readonly countryCode: string;
}

export interface AnchorPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type PickerTarget = "from" | "to";

export interface CurrencyPickerProps {
  visible: boolean;
  anchorPosition: AnchorPosition | null;
  selectedCode: string;
  currencies: readonly Currency[];
  onSelect: (currency: Currency) => void;
  onClose: () => void;
}

export interface CurrencySwitcherProps {
  currencies?: readonly Currency[];
  defaultFromCurrency?: Currency;
  defaultToCurrency?: Currency;
  defaultSendAmount?: string;
  rate?: number;
  isRateLoading?: boolean;
  fee?: number;
  arrivalEstimate?: string;
  swapIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onAmountChange?: (amount: string) => void;
  onCurrencyChange?: (from: Currency, to: Currency) => void;
  onSend?: (details: { amount: number; from: Currency; to: Currency }) => void;
}

export type ExchangeRateFetcher = (base: string, target: string) => Promise<number>;

export interface UseExchangeRateOptions {
  fetcher?: ExchangeRateFetcher;
  cacheTtlMs?: number;
  enabled?: boolean;
}

export interface UseExchangeRateResult {
  rate: number | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}
import type { Coin } from "../constants/types";
import { useCryptoPrice } from "./useCryptoPrice";
import { formatAmount, parseAmount } from "../utils/amount";
import { lookupPriceOverride } from "../utils/coins";

export interface UseQuoteParams {
  fromCoin: Coin;
  toCoin: Coin;
  spread: number;
  prices: Readonly<Record<string, number>> | undefined;
  activeField: "send" | "receive";
  activeAmount: string;
}

export function useQuote({
  fromCoin,
  toCoin,
  spread,
  prices,
  activeField,
  activeAmount,
}: UseQuoteParams) {
  const numericActiveAmount = parseAmount(activeAmount);

  const fromOverride = lookupPriceOverride(prices, fromCoin.symbol);
  const toOverride = lookupPriceOverride(prices, toCoin.symbol);

  const { priceUsd: fetchedFromPrice, isLoading: fromLoading } = useCryptoPrice(
    fromCoin.symbol,
    {
      enabled: fromOverride === undefined,
    }
  );
  const { priceUsd: fetchedToPrice, isLoading: toLoading } = useCryptoPrice(
    toCoin.symbol,
    {
      enabled: toOverride === undefined,
    }
  );

  const fromPriceUsd = fromOverride ?? fetchedFromPrice;
  const toPriceUsd = toOverride ?? fetchedToPrice;

  const isSameCoin = fromCoin.symbol === toCoin.symbol;
  const firstLoad = fromPriceUsd === null || toPriceUsd === null;

  const isQuotePending = firstLoad || fromLoading || toLoading;

  const effectiveRate =
    firstLoad || toPriceUsd === 0
      ? null
      : isSameCoin
        ? 1
        : (fromPriceUsd / toPriceUsd) * (1 - spread);

  const numericSendAmount =
    activeField === "send"
      ? numericActiveAmount
      : firstLoad || effectiveRate === null || effectiveRate === 0
        ? 0
        : numericActiveAmount / effectiveRate;

  const numericReceiveAmount =
    activeField === "receive"
      ? numericActiveAmount
      : firstLoad || effectiveRate === null
        ? 0
        : numericActiveAmount * effectiveRate;

  const displaySendAmount = formatAmount(numericSendAmount);
  const receiveAmount =
    activeField === "receive" || !firstLoad
      ? formatAmount(numericReceiveAmount)
      : null;

  const isAmountEmpty = activeAmount === "";
  const isSendDimmed = isQuotePending || isAmountEmpty;
  const isReceiveDimmed =
    isQuotePending || isAmountEmpty || receiveAmount === null;

  const sendVisibleAmount =
    activeField === "send"
      ? activeAmount === ""
        ? "0"
        : activeAmount
      : displaySendAmount;
  const receiveVisibleAmount =
    activeField === "receive"
      ? activeAmount === ""
        ? "0"
        : activeAmount
      : (receiveAmount ?? "0.00");

  const payValueUsd = numericSendAmount * (fromPriceUsd ?? 0);
  const receiveValueUsd = isSameCoin ? payValueUsd : payValueUsd * (1 - spread);

  const quoteTransitionKey = `${fromCoin.symbol}-${toCoin.symbol}-${fromPriceUsd ?? "na"}-${toPriceUsd ?? "na"}`;

  return {
    fromPriceUsd,
    toPriceUsd,
    isSameCoin,
    firstLoad,
    isQuotePending,
    effectiveRate,
    numericSendAmount,
    numericReceiveAmount,
    displaySendAmount,
    receiveAmount,
    isAmountEmpty,
    isSendDimmed,
    isReceiveDimmed,
    sendVisibleAmount,
    receiveVisibleAmount,
    payValueUsd,
    receiveValueUsd,
    quoteTransitionKey,
  };
}

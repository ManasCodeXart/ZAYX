// utils/currency.ts

import type { Currency } from "../constants/types";

export function findCurrencyByCode(
  currencies: readonly Currency[],
  code: string
): Currency | undefined {
  const match = currencies.find((currency) => currency.code === code);

  if (!match && typeof __DEV__ !== "undefined" && __DEV__) {
    console.warn(
      `CurrencySwitcher: no currency found for code "${code}". ` +
        `Pass a matching "currencies" list, or set "defaultFromCurrency"/"defaultToCurrency" explicitly.`
    );
  }

  return match;
}
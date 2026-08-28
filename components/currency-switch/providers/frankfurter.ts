import type { ExchangeRateFetcher } from "../constants/types";

const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v1/latest";


export const fetchFrankfurterRate: ExchangeRateFetcher = async (base, target) => {
  const url = `${FRANKFURTER_RATES_URL}?base=${base}&symbols=${target}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Frankfurter request failed (${response.status})`);
  }

  const data = await response.json();
  const rate = data?.rates?.[target];

  if (typeof rate !== "number") {
    throw new Error(`Frankfurter returned no rate for ${base} → ${target}`);
  }

  return rate;
};
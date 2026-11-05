export const MAX_DECIMAL_PLACES = 8;

export const MAX_DISPLAY_DECIMALS = 8;

export const MAX_WHOLE_DIGITS = 12;

export const MAX_AMOUNT_INPUT_LENGTH =
  MAX_WHOLE_DIGITS + 1 + MAX_DECIMAL_PLACES;

export function sanitizeAmountInput(value: string): string {

  const normalized = value.replace(/,/g, ".");

  const digitsAndDots = normalized.replace(/[^0-9.]/g, "");

  if (digitsAndDots === "") return "";

  const firstDotIndex = digitsAndDots.indexOf(".");

  if (firstDotIndex === -1) {
    return collapseLeadingZeros(digitsAndDots);
  }

  const rawWhole = digitsAndDots.slice(0, firstDotIndex);
  const rawDecimal = digitsAndDots.slice(firstDotIndex + 1).replace(/\./g, "");

  const decimalPart = rawDecimal.slice(0, MAX_DECIMAL_PLACES);

  const wholePart = collapseLeadingZeros(rawWhole);

  return wholePart + "." + decimalPart;
}

function collapseLeadingZeros(s: string): string {
  const collapsed = s.replace(/^0+/, "");
  return collapsed === "" ? "0" : collapsed;
}

export function parseAmount(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const trimmed = value.toFixed(MAX_DISPLAY_DECIMALS).replace(/\.?0+$/, "");
  return trimmed === "" || trimmed === "-0" ? "0" : trimmed;
}

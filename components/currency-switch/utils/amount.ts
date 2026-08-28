// utils/amount.ts

export const MAX_DECIMAL_PLACES = 2;

export function sanitizeAmountInput(value: string): string {
  // Strip everything except digits and dots, collapse multiple dots
  const digitsAndDots = value.replace(/[^0-9.]/g, "");

  if (digitsAndDots === "") return "";

  const firstDotIndex = digitsAndDots.indexOf(".");

  // No dot — clean whole number
  if (firstDotIndex === -1) {
    return collapseLeadingZeros(digitsAndDots);
  }

  // Split at first dot
  const rawWhole = digitsAndDots.slice(0, firstDotIndex);
  const rawDecimal = digitsAndDots.slice(firstDotIndex + 1).replace(/\./g, "");

  // Clamp decimal places
  const decimalPart = rawDecimal.slice(0, MAX_DECIMAL_PLACES);

  // Collapse leading zeros in whole part
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
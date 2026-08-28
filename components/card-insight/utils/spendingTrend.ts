import type { SpendingTrend } from '../constants/types'

/**
 * Computes week-over-week spending trend as a single derived value instead
 * of two independently-settable props (the previous `spendingDelta` +
 * `isIncrease` pair could disagree with each other — a real risk on a
 * component displaying financial data).
 *
 * When there's no prior week to compare against (new card), returns
 * `hasComparison: false` and the caller should render a placeholder instead
 * of a percentage.
 */
export function getSpendingTrend(currentWeekSpend: number, previousWeekSpend: number): SpendingTrend {
  if (previousWeekSpend === 0) {
    return { percentChange: 0, isIncrease: false, hasComparison: false }
  }

  const rawChange = ((currentWeekSpend - previousWeekSpend) / previousWeekSpend) * 100

  return {
    percentChange: Math.abs(rawChange),
    isIncrease: rawChange > 0,
    hasComparison: true,
  }
}
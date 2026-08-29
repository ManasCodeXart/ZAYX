export function clamp(value: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(Math.max(value, lo), hi);
}
export const fireHaptic = (invoke: () => Promise<void>): void => {
  invoke().catch(() => {})
}
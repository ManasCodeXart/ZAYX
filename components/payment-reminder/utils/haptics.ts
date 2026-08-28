type HapticTrigger = () => Promise<void> | void;


export function fireHaptic(trigger: HapticTrigger): void {
  try {
    const result = trigger();
    if (result instanceof Promise) {
      result.catch(() => {});
    }
  } catch {
    
  }
}

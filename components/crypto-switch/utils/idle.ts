type IdleCapableGlobal = {
  readonly requestIdleCallback?: (callback: () => void) => void;
};

const idleGlobal = globalThis as IdleCapableGlobal;

/**
 * Runs `callback` during idle time when the runtime provides
 * `requestIdleCallback`, falling back to a macrotask otherwise.
 */
export function runWhenIdle(callback: () => void): void {
  if (typeof idleGlobal.requestIdleCallback === "function") {
    idleGlobal.requestIdleCallback(callback);
    return;
  }

  setTimeout(callback, 0);
}

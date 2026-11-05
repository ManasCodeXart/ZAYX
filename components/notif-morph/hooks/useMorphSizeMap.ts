import { useCallback, useState } from "react";

import type { MorphSizeMap } from "../constants/types";

function useMorphSizeMap() {
  const [sizes, setSizes] = useState<MorphSizeMap>({});

  const measure = useCallback((key: string, w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    setSizes((current) => {
      const existing = current[key];
      if (existing?.w === w && existing.h === h) return current;
      return { ...current, [key]: { w, h } };
    });
  }, []);

  return { measure, sizes };
}

export { useMorphSizeMap };

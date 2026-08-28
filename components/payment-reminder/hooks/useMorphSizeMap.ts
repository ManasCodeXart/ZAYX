import { useCallback, useState } from "react";

import type { MorphSize, MorphSizeMap } from "../morph/types";


function useMorphSizeMap() {
  const [sizes, setSizes] = useState<MorphSizeMap>({});
  const [baseSize, setBaseSize] = useState<MorphSize>({ w: 0, h: 0 });

  const measure = useCallback((key: string, w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    setSizes((current) => {
      const existing = current[key];
      if (existing?.w === w && existing.h === h) return current;
      return { ...current, [key]: { w, h } };
    });
  }, []);

  const measureBase = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0) return;
    setBaseSize((current) =>
      current.w === w && current.h === h ? current : { w, h },
    );
  }, []);

  return { baseSize, measure, measureBase, sizes };
}

export { useMorphSizeMap };


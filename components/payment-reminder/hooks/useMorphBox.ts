import { useEffect } from "react";
import {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { MORPH_COLLAPSED, MORPH_DURATION, MORPH_EASING } from "../morph/constants";
import type { UseMorphBoxOptions } from "../morph/types";


function useMorphBox({
  activeKey,
  collapsedSize,
  duration = MORPH_DURATION,
  easing = MORPH_EASING,
  minWidth = 0,
  mode = "stack",
  sizes,
}: UseMorphBoxOptions) {
  const boxW = useSharedValue<number>(0);
  const boxH = useSharedValue<number>(0);
  const openProgress = useSharedValue<number>(0);

  useEffect(() => {
    if (collapsedSize.w === 0 || collapsedSize.h === 0) return;

  
    const firstInit = boxW.value === 0;
    const isCollapsed = !activeKey || activeKey === MORPH_COLLAPSED;

    if (isCollapsed) {
      boxW.value =
        firstInit ? collapsedSize.w : (
          withTiming(collapsedSize.w, { duration, easing })
        );
      boxH.value =
        firstInit ? collapsedSize.h : (
          withTiming(collapsedSize.h, { duration, easing })
        );
      openProgress.value =
        firstInit ? 0 : withTiming(0, { duration: duration - 80, easing });
      return;
    }

    const target = sizes[activeKey];
    if (!target || target.w <= 0 || target.h <= 0) return;

    const targetW = Math.max(minWidth, collapsedSize.w, target.w);
    const targetH =
      mode === "stack" ? collapsedSize.h + target.h : target.h;

    boxW.value =
      firstInit ? targetW : withTiming(targetW, { duration, easing });
    boxH.value =
      firstInit ? targetH : withTiming(targetH, { duration, easing });
    openProgress.value = withTiming(1, { duration, easing });
  }, [
    activeKey,
    boxH,
    boxW,
    collapsedSize.h,
    collapsedSize.w,
    duration,
    easing,
    minWidth,
    mode,
    openProgress,
    sizes,
  ]);

  const boxStyle = useAnimatedStyle(() => {
    if (boxW.value === 0 || boxH.value === 0) return {};
    return { height: boxH.value, width: boxW.value };
  });

 
  const openStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
  }));

  return { boxStyle, openProgress, openStyle };
}

export { useMorphBox };



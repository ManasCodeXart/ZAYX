import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  MORPH_DURATION,
  MORPH_EASING,
  MORPH_SLIDE_DISTANCE,
  MORPH_SPRING,
} from "../constants/constants";
import type { UseMorphContentOptions } from "../constants/types";

function useMorphContent({
  active,
  direction = 0,
  duration = MORPH_DURATION - 80,
  easing = MORPH_EASING,
  slideDistance = MORPH_SLIDE_DISTANCE,
}: UseMorphContentOptions) {
  const progress = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(active ? 1 : 0.97);
  const activeShared = useSharedValue(active);
  const directionShared = useSharedValue(direction);
  const slideDistanceShared = useSharedValue(slideDistance);

  useEffect(() => {
    activeShared.value = active;
    directionShared.value = direction;
    slideDistanceShared.value = slideDistance;
    progress.value = withTiming(active ? 1 : 0, { duration, easing });
    scale.value = withSpring(active ? 1 : 0.97, MORPH_SPRING);
  }, [
    active,
    direction,
    duration,
    easing,
    progress,
    scale,
    activeShared,
    directionShared,
    slideDistance,
    slideDistanceShared,
  ]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const dir = directionShared.value;
    const travel = dir === 0 ? 0 : dir * slideDistanceShared.value;
    const translateX = activeShared.value
      ? travel * (1 - p)
      : -travel * (1 - p);
    return {
      opacity: p,
      transform: [{ translateX }, { scale: scale.value }],
    };
  });

  return { progress, style };
}

export { useMorphContent };

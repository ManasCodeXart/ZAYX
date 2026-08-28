import { useCallback, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const SWAP_SPRING_CONFIG = { damping: 14, stiffness: 160, mass: 0.9 };

export function useCardSwap() {
  const firstCardY = useSharedValue(0);
  const secondCardY = useSharedValue(0);
  const firstCardTranslateY = useSharedValue(0);
  const secondCardTranslateY = useSharedValue(0);

 
  const isAnimatingRef = useRef(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const measureFirstCard = useCallback(
    (event: LayoutChangeEvent) => {
      firstCardY.value = event.nativeEvent.layout.y;
    },
    [firstCardY]
  );

  const measureSecondCard = useCallback(
    (event: LayoutChangeEvent) => {
      secondCardY.value = event.nativeEvent.layout.y;
    },
    [secondCardY]
  );

  const handleSwapComplete = useCallback(() => {
    isAnimatingRef.current = false;
    setIsSwapping(false);
  }, []);

  const triggerSwap = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsSwapping(true);

    const distance = secondCardY.value - firstCardY.value;

    if (Math.abs(distance) > 1) {
      firstCardTranslateY.value = distance;
      secondCardTranslateY.value = -distance;
    }

    firstCardTranslateY.value = withSpring(0, SWAP_SPRING_CONFIG);
    secondCardTranslateY.value = withSpring(
      0,
      SWAP_SPRING_CONFIG,
      (finished) => {
        if (finished) {
          runOnJS(handleSwapComplete)();
        }
      }
    );
  }, [
    firstCardY,
    secondCardY,
    firstCardTranslateY,
    secondCardTranslateY,
    handleSwapComplete,
  ]);

  const firstCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: firstCardTranslateY.value }],
  }));

  const secondCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: secondCardTranslateY.value }],
  }));

  return {
    measureFirstCard,
    measureSecondCard,
    triggerSwap,
    isSwapping,
    firstCardStyle,
    secondCardStyle,
  };
}
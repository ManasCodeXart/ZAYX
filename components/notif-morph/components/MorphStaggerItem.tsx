import { useEffect, type ReactNode } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const STAGGER_BASE_DELAY = 140;
const STAGGER_STEP = 45;
const STAGGER_DURATION = 500;
const STAGGER_OUT_DURATION = 160;
const STAGGER_EASING = Easing.inOut(Easing.ease);

type MorphStaggerItemProps = {
  active: boolean;
  children: ReactNode;
  index: number;
};

function MorphStaggerItem({ active, children, index }: MorphStaggerItemProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withDelay(
        STAGGER_BASE_DELAY + index * STAGGER_STEP,
        withTiming(1, { duration: STAGGER_DURATION, easing: STAGGER_EASING }),
      );
      return;
    }

    progress.value = withTiming(0, {
      duration: STAGGER_OUT_DURATION,
      easing: STAGGER_EASING,
    });
  }, [active, index, progress]);

  const style = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View style={[styles.item, style]}>{children}</Animated.View>
  );
}

export { MorphStaggerItem };

const styles = StyleSheet.create({
  item: {
    opacity: 0,
  },
});

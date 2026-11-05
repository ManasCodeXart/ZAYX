import { memo, type ReactNode } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { type EasingFunctionFactory } from "react-native-reanimated";

import { useMorphContent } from "../hooks/useMorphContent";

interface MorphContentLayerProps {
  active: boolean;
  children: ReactNode;
  contentKey: string;
  direction?: -1 | 0 | 1;
  duration?: number;
  easing?: EasingFunctionFactory;
  onMeasure: (key: string, w: number, h: number) => void;
}

const MorphContentLayer = memo(
  ({
    active,
    children,
    contentKey,
    direction = 0,
    duration,
    easing,
    onMeasure,
  }: MorphContentLayerProps) => {
    const motion = useMorphContent({ active, direction, duration, easing });

    return (
      <Animated.View
        pointerEvents={active ? "auto" : "none"}
        accessibilityElementsHidden={!active}
        importantForAccessibility={active ? "auto" : "no-hide-descendants"}
        style={[styles.layer, motion.style]}
      >
        <View
          onLayout={(event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;
            onMeasure(contentKey, Math.ceil(width), Math.ceil(height));
          }}
        >
          {children}
        </View>
      </Animated.View>
    );
  },
);

MorphContentLayer.displayName = "MorphContentLayer";

const styles = StyleSheet.create({
  layer: {
    left: 0,
    position: "absolute",
    top: 0,
  },
});

export { MorphContentLayer };

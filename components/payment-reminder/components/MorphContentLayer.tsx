import { memo, type FC, type ReactNode } from "react";
import { StyleSheet, type LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";

import { useMorphContent } from "../hooks/useMorphContent";

interface MorphContentLayerProps {
  active: boolean;
  children: ReactNode;
  contentKey: string;
  direction?: -1 | 0 | 1;
  onMeasure: (key: string, w: number, h: number) => void;
}


const MorphContentLayer: FC<MorphContentLayerProps> = memo(
  ({
    active,
    children,
    contentKey,
    direction = 0,
    onMeasure,
  }: MorphContentLayerProps) => {
    const motion = useMorphContent({ active, direction });

    return (
      <Animated.View
        pointerEvents={active ? "auto" : "none"}
        style={[styles.layer, motion.style]}
      >
        <Animated.View
          onLayout={(event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout;
            onMeasure(contentKey, Math.ceil(width), Math.ceil(height));
          }}
        >
          {children}
        </Animated.View>
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



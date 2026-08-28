import { memo, type FC } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";

import type { MorphKeyedRenderItem } from "../morph/types";

interface MorphMeasureLayerProps {
  items: MorphKeyedRenderItem[];
  onMeasure: (key: string, w: number, h: number) => void;
}


const MorphMeasureLayer: FC<MorphMeasureLayerProps> = memo(
  ({ items, onMeasure }: MorphMeasureLayerProps) => {
    return (
      <View pointerEvents="none" style={styles.hidden}>
        {items.map((item) => (
          <View
            key={item.key}
            onLayout={(event: LayoutChangeEvent) => {
              const { width, height } = event.nativeEvent.layout;
              onMeasure(item.key, Math.ceil(width), Math.ceil(height));
            }}
          >
            {item.render()}
          </View>
        ))}
      </View>
    );
  },
);

MorphMeasureLayer.displayName = "MorphMeasureLayer";

const styles = StyleSheet.create({
  hidden: {
    left: -10000,
    opacity: 0,
    position: "absolute",
    top: -10000,
  },
});

export { MorphMeasureLayer };



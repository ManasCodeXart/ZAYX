import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';



const MIN = 100;
const MAX = 1800;
const STEP = 100;
const TICK_COUNT = (MAX - MIN) / STEP + 1; // 18
const THUMB_WIDTH = 22;
const THUMB_HEIGHT = 44;
const TICK_WIDTH = 2.5;
const TICK_GAP = 10;
const TALL_TICK_HEIGHT = 28;
const SHORT_TICK_HEIGHT = 16;

const SNAP_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.6,
};



function valueToIndex(value: number): number {
  'worklet';
  return Math.round((value - MIN) / STEP);
}

function indexToValue(index: number): number {
  'worklet';
  return MIN + index * STEP;
}

function clamp(val: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(Math.max(val, lo), hi);
}



interface TickSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}


const Tick = React.memo(
  ({
    index,
    thumbIndex,
  }: {
    index: number;
    thumbIndex: SharedValue<number>;
  }) => {
    const isTall = index % 3 === 0;

    const animStyle = useAnimatedStyle(() => {
      const isActive = index < thumbIndex.value;
      return {
        backgroundColor: isActive
          ? 'rgba(255,255,255,0.85)'
          : 'rgba(255,255,255,0.2)',
        height: TALL_TICK_HEIGHT,
      };
    });

    return <Animated.View style={[styles.tick, animStyle]} />;
  }
);


export default function TickSlider({ value, onValueChange }: TickSliderProps) {
  
  const trackWidth = useSharedValue(0);

  
  const thumbX = useSharedValue(0);

  
  const thumbIndex = useSharedValue(valueToIndex(value));

  
  const dragStartX = useSharedValue(0);

  
  const tickSpacing = useSharedValue(TICK_WIDTH + TICK_GAP);

  const notifyValue = useCallback(
  (index: number) => {
    onValueChange(indexToValue(index));
    Haptics.selectionAsync();
  },
  [onValueChange]
);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      trackWidth.value = width;

    
      const spacing = (width - THUMB_WIDTH) / (TICK_COUNT - 1);
      tickSpacing.value = spacing;

      // Set initial thumb position
      const initialIndex = valueToIndex(value);
      thumbIndex.value = initialIndex;
      thumbX.value = initialIndex * spacing;
    },
    [value]
  );

  const panGesture = Gesture.Pan()
  .onBegin(() => {
    dragStartX.value = thumbX.value;
  })
  .onUpdate((e) => {
    const newX = clamp(dragStartX.value + e.translationX, 0, trackWidth.value - THUMB_WIDTH);
    thumbX.value = newX;

    const rawIndex = newX / tickSpacing.value;
    const snappedIndex = clamp(Math.round(rawIndex), 0, TICK_COUNT - 1);

    if (snappedIndex !== thumbIndex.value) {
      thumbIndex.value = snappedIndex;
      runOnJS(notifyValue)(snappedIndex);
    }
  })
  .onEnd(() => {
    const snappedIndex = clamp(
      Math.round(thumbX.value / tickSpacing.value),
      0,
      TICK_COUNT - 1
    );
    const snappedX = snappedIndex * tickSpacing.value;

    thumbX.value = withSpring(snappedX, SNAP_SPRING);

    // only notify if this actually changes the value —
    // avoids a redundant haptic buzz when releasing on the same tick
    if (snappedIndex !== thumbIndex.value) {
      thumbIndex.value = snappedIndex;
      runOnJS(notifyValue)(snappedIndex);
    }
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container} onLayout={onLayout}>
        {/* Ticks */}
        <View style={styles.tickRow}>
          {Array.from({ length: TICK_COUNT }).map((_, i) => (
            <Tick key={i} index={i} thumbIndex={thumbIndex} />
          ))}
        </View>

        
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}



const styles = StyleSheet.create({
  container: {
    height: THUMB_HEIGHT + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THUMB_WIDTH / 2,
  },
  tick: {
    width: TICK_WIDTH,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: THUMB_WIDTH / 2,
    backgroundColor: '#ffffff75',
    top: '50%',
    marginTop: -(THUMB_HEIGHT / 2),
    // subtle inner highlight
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
   
  },
});
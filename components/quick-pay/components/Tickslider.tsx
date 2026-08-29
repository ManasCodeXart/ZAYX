import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { SharedValue } from 'react-native-reanimated';

import type { TickSliderProps } from '../constants/types';
import { clamp } from '../utils/math';

const DEFAULT_MIN = 100;
const DEFAULT_MAX = 1800;
const DEFAULT_STEP = 100;

const THUMB_WIDTH = 22;
const THUMB_HEIGHT = 44;
const TICK_WIDTH = 2.5;
const TICK_GAP = 10;
const TICK_HEIGHT = 28;

const SNAP_SPRING = { damping: 22, stiffness: 180, mass: 0.6 };

export function valueToIndex(value: number, min: number, step: number): number {
  'worklet';
  return Math.round((value - min) / step);
}

export function indexToValue(index: number, min: number, step: number): number {
  'worklet';
  return min + index * step;
}

function snapIndexForOffset(offset: number, spacing: number, tickCount: number): number {
  'worklet';
  return clamp(Math.round(offset / spacing), 0, tickCount - 1);
}

interface TickProps {
  readonly index: number;
  readonly thumbIndex: SharedValue<number>;
}

const Tick = memo(function Tick({ index, thumbIndex }: TickProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      index < thumbIndex.value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)',
  }));

  return <Animated.View style={[styles.tick, animatedStyle]} />;
});

export default function TickSlider({
  value,
  onValueChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
}: TickSliderProps) {

  const tickCount = useMemo(() => Math.round((max - min) / step) + 1, [min, max, step]);
  const trackWidth = useSharedValue(0);
  const tickSpacing = useSharedValue(TICK_WIDTH + TICK_GAP);
  const thumbX = useSharedValue(0);
  const thumbIndex = useSharedValue(valueToIndex(clamp(value, min, max), min, step));
  const dragStartX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const notifyValue = useCallback(
    (index: number) => {
      onValueChange(indexToValue(index, min, step));
      Haptics.selectionAsync();
    },
    [onValueChange, min, step]
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      const spacing = (width - THUMB_WIDTH) / (tickCount - 1);
      const initialIndex = valueToIndex(clamp(value, min, max), min, step);

      trackWidth.value = width;
      tickSpacing.value = spacing;
      thumbIndex.value = initialIndex;
      thumbX.value = initialIndex * spacing;
    },
    [value, min, max, step, tickCount]
  );


useEffect(() => {
   if (trackWidth.value === 0 || isDragging.value) return;

   const nextIndex = valueToIndex(clamp(value, min, max), min, step);
   if (nextIndex === thumbIndex.value) return;

   thumbIndex.value = nextIndex;
   thumbX.value = withSpring(nextIndex * tickSpacing.value, SNAP_SPRING);
 }, [value, min, max, step]);




  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          dragStartX.value = thumbX.value;
        })
        .onUpdate((e) => {
          const nextX = clamp(dragStartX.value + e.translationX, 0, trackWidth.value - THUMB_WIDTH);
          thumbX.value = nextX;

          const snappedIndex = snapIndexForOffset(nextX, tickSpacing.value, tickCount);
          if (snappedIndex !== thumbIndex.value) {
            thumbIndex.value = snappedIndex;
            runOnJS(notifyValue)(snappedIndex);
            isDragging.value = false;
          }
        })
        .onEnd(() => {
          const snappedIndex = snapIndexForOffset(thumbX.value, tickSpacing.value, tickCount);
          const snappedX = snappedIndex * tickSpacing.value;

          thumbX.value = withSpring(snappedX, SNAP_SPRING);

          if (snappedIndex !== thumbIndex.value) {
            thumbIndex.value = snappedIndex;
            runOnJS(notifyValue)(snappedIndex);
          }
        }),
    [tickCount, notifyValue]
  );

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container} onLayout={onLayout}>
        <View style={styles.tickRow}>
          {Array.from({ length: tickCount }, (_, i) => (
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
  },
  tickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THUMB_WIDTH / 2,
  },
  tick: {
    width: TICK_WIDTH,
    height: TICK_HEIGHT,
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
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
});
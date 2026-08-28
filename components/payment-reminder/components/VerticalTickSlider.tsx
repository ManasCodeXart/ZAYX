import { memo, useCallback } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { verticalScale } from '../constants/scaling';
import type { VerticalTickSliderProps } from '../constants/types';

const THUMB_WIDTH = verticalScale(22);
const THUMB_HEIGHT = verticalScale(44);
const TICK_WIDTH = 2.5;
const TALL_TICK_HEIGHT = verticalScale(28);
const SHORT_TICK_HEIGHT = verticalScale(16);
const TICK_SPACING = TICK_WIDTH + verticalScale(10);
const TRACK_PADDING = verticalScale(8);

const SNAP_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.6,
};

function valueToIndex(value: number, min: number, step: number): number {
  'worklet';
  return Math.round((value - min) / step);
}

function indexToValue(index: number, min: number, step: number): number {
  'worklet';
  return min + index * step;
}

function clamp(val: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(Math.max(val, lo), hi);
}

function tickCount(min: number, max: number, step: number): number {
  return Math.round((max - min) / step) + 1;
}

interface TickProps {
  readonly index: number;
  readonly thumbIndex: SharedValue<number>;
  readonly activeColor: string;
  readonly inactiveColor: string;
}

const Tick = memo(function Tick({ index, thumbIndex, activeColor, inactiveColor }: TickProps) {
  const isTall = index % 3 === 0;
  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: index < thumbIndex.value ? activeColor : inactiveColor,
    height: isTall ? TALL_TICK_HEIGHT : SHORT_TICK_HEIGHT,
  }));
  return <Animated.View style={[styles.tick, animStyle]} />;
});

function VerticalTickSlider({
  value,
  onValueChange,
  min = 1,
  max = 31,
  step = 1,
  activeColor = 'rgba(255,255,255,0.85)',
  inactiveColor = 'rgba(255,255,255,0.2)',
  thumbColor = '#ffffff75',
  width = verticalScale(32),
  height,
}: VerticalTickSliderProps) {
  const TICK_COUNT = tickCount(min, max, step);

  const trackLength = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const thumbIndex = useSharedValue(valueToIndex(value, min, step));
  const dragStartX = useSharedValue(0);
  const tickSpacing = useSharedValue(TICK_SPACING);

  const notifyValue = useCallback(
    (index: number) => onValueChange(indexToValue(index, min, step)),
    [onValueChange, min, step]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const length = e.nativeEvent.layout.width;
    trackLength.value = length;
    const spacing = (length - THUMB_WIDTH) / (TICK_COUNT - 1);
    tickSpacing.value = spacing;
    const initialIndex = valueToIndex(value, min, step);
    thumbIndex.value = initialIndex;
    thumbX.value = initialIndex * spacing;
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const newX = clamp(dragStartX.value + e.translationY, 0, trackLength.value - THUMB_WIDTH);
      thumbX.value = newX;
      const snappedIndex = clamp(Math.round(newX / tickSpacing.value), 0, TICK_COUNT - 1);
      if (snappedIndex !== thumbIndex.value) {
        thumbIndex.value = snappedIndex;
        runOnJS(notifyValue)(snappedIndex);
      }
    })
    .onEnd(() => {
      const snappedIndex = clamp(Math.round(thumbX.value / tickSpacing.value), 0, TICK_COUNT - 1);
      thumbX.value = withSpring(snappedIndex * tickSpacing.value, SNAP_SPRING);
      thumbIndex.value = snappedIndex;
      runOnJS(notifyValue)(snappedIndex);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const internalLength = height ?? TICK_COUNT * TICK_SPACING + THUMB_WIDTH;

  return (
    <View style={[styles.outer, { width, height: internalLength }]}>
      <View style={[styles.rotatedTrackWrapper, { width: internalLength, height: THUMB_HEIGHT + TRACK_PADDING }]}>
        <GestureDetector gesture={panGesture}>
          <View
            style={[styles.track, { width: internalLength, height: THUMB_HEIGHT + TRACK_PADDING }]}
            onLayout={onLayout}
          >
            <View style={styles.tickRow}>
              {Array.from({ length: TICK_COUNT }).map((_, i) => (
                <Tick
                  key={i}
                  index={i}
                  thumbIndex={thumbIndex}
                  activeColor={activeColor}
                  inactiveColor={inactiveColor}
                />
              ))}
            </View>
            <Animated.View
              style={[
                styles.thumb,
                thumbStyle,
                {
                  width: THUMB_WIDTH,
                  height: THUMB_HEIGHT,
                  borderRadius: THUMB_WIDTH / 2,
                  backgroundColor: thumbColor,
                },
              ]}
            />
          </View>
        </GestureDetector>
      </View>
    </View>
  );
}

VerticalTickSlider.displayName = 'VerticalTickSlider';

export default memo(VerticalTickSlider);

const styles = StyleSheet.create({
  outer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedTrackWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '90deg' }],
  },
  track: {
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
    top: '50%',
    marginTop: -(THUMB_HEIGHT / 2),
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: verticalScale(4),
  },
});


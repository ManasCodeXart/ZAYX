import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { verticalScale } from '../constants/scaling';
import type { DateScrollPickerProps } from '../constants/types';



const ITEM_HEIGHT = verticalScale(42);
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CLONE_COUNT = 2;
const DEFAULT_WIDTH = verticalScale(48);

const SNAP_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.6,
};

const FLICK_FACTOR = 0.18; 

function clampValue(val: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(Math.max(val, lo), hi);
}



interface PickerItemProps {
  readonly label: string;
  readonly index: number;
  readonly scrollY: SharedValue<number>;
}

const PickerItem = memo(function PickerItem({ label, index, scrollY }: PickerItemProps) {
  const animStyle = useAnimatedStyle(() => {
    const center = index * ITEM_HEIGHT;
    const distance = Math.abs(scrollY.value - center);

    const scale = interpolate(
      distance,
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1.45, 0.95, 0.7],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      distance,
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1, 0.4, 0.15],
      Extrapolation.CLAMP
    );

    return { opacity, transform: [{ scale }] };
  });

  const textStyle = useAnimatedStyle(() => {
    const center = index * ITEM_HEIGHT;
    const distance = Math.abs(scrollY.value - center);
    const isCenter = distance < ITEM_HEIGHT * 0.5;

    return {
      color: isCenter ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
      fontWeight: isCenter ? '700' : '400',
    };
  });

  return (
    <View style={styles.item}>
      <Animated.View style={animStyle}>
        <Animated.Text style={[styles.itemText, textStyle]}>{label}</Animated.Text>
      </Animated.View>
    </View>
  );
});



function DateScrollPicker({
  min = 1,
  max = 31,
  value,
  width = DEFAULT_WIDTH,
  onValueChange,
}: DateScrollPickerProps) {
  const data = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
  const count = data.length;

  const loopedData = useMemo(
    () => [...data.slice(-CLONE_COUNT), ...data, ...data.slice(0, CLONE_COUNT)],
    [data]
  );

  const maxOffset = (loopedData.length - 1) * ITEM_HEIGHT;
  const scrollY = useSharedValue((CLONE_COUNT + (value - min)) * ITEM_HEIGHT);
  const dragStartY = useSharedValue(0);

  const notifyValue = useCallback(
    (realIndex: number) => onValueChange(data[realIndex]),
    [data, onValueChange]
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartY.value = scrollY.value;
    })
    .onUpdate((e) => {
      scrollY.value = clampValue(dragStartY.value - e.translationY, 0, maxOffset);
    })
    .onEnd((e) => {
      const projected = clampValue(scrollY.value - e.velocityY * FLICK_FACTOR, 0, maxOffset);
      const rawIndex = Math.round(projected / ITEM_HEIGHT);
      const realIndex = rawIndex - CLONE_COUNT;

      if (realIndex >= count || realIndex < 0) {
        const wrappedIndex = ((realIndex % count) + count) % count;
        scrollY.value = (CLONE_COUNT + wrappedIndex) * ITEM_HEIGHT;
        runOnJS(notifyValue)(wrappedIndex);
        return;
      }

      scrollY.value = withSpring(rawIndex * ITEM_HEIGHT, SNAP_SPRING);
      runOnJS(notifyValue)(realIndex);
    });

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: CONTAINER_HEIGHT / 2 - scrollY.value - ITEM_HEIGHT / 2 }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { width }]}>
        <Animated.View style={[styles.list, listStyle]}>
          {loopedData.map((num, index) => (
            <PickerItem key={`${index}-${num}`} label={String(num)} index={index} scrollY={scrollY} />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

DateScrollPicker.displayName = 'DateScrollPicker';

export default memo(DateScrollPicker);



const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    overflow: 'hidden',
  },
  list: {
    paddingVertical: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: verticalScale(22),
    letterSpacing: 0,
  },
});


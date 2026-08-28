import * as Haptics from 'expo-haptics';
import { memo, useCallback, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import type { SharedValue } from 'react-native-reanimated';

import { verticalScale } from '../constants/scaling';
import type { AvatarCarouselProps, Contact } from '../constants/types';

const ITEM_SIZE = verticalScale(60);
const SPACING = verticalScale(82);
const SNAP_INTERVAL = ITEM_SIZE + SPACING;
const AVATAR_DROP_OFFSET = verticalScale(8);


export const DEFAULT_CAROUSEL_INDEX = 3;

interface AvatarItemProps {
  readonly avatar: Contact['avatar'];
  readonly handle: string;
  readonly index: number;
  readonly scrollX: SharedValue<number>;
}

const AvatarItem = memo(function AvatarItem({ avatar, handle, index, scrollX }: AvatarItemProps) {
  const avatarStyle = useAnimatedStyle(() => {
    const position = index * SNAP_INTERVAL;
    const distance = Math.abs(scrollX.value - position);

    const scale = interpolate(
      distance,
      [0, SNAP_INTERVAL, SNAP_INTERVAL * 2],
      [1.55, 1.0, 0.72],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      distance,
      [0, SNAP_INTERVAL, SNAP_INTERVAL * 2],
      [1, 0.55, 0.25],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(distance, [0, SNAP_INTERVAL], [0, AVATAR_DROP_OFFSET], Extrapolation.CLAMP);

    return { opacity, transform: [{ scale }, { translateY }] };
  });

  const handleStyle = useAnimatedStyle(() => {
    const position = index * SNAP_INTERVAL;
    const distance = Math.abs(scrollX.value - position);
    return { opacity: interpolate(distance, [0, ITEM_SIZE * 0.5], [1, 0], Extrapolation.CLAMP) };
  });

  return (
    <View style={styles.itemWrapper}>
      <Animated.Image source={avatar} style={[styles.avatar, avatarStyle]} />
      <Animated.Text style={[styles.handleText, handleStyle]} numberOfLines={1}>
        {handle}
      </Animated.Text>
    </View>
  );
});

export default function AvatarCarousel({
  contacts,
  initialIndex = DEFAULT_CAROUSEL_INDEX,
  onContactChange,
  height = verticalScale(120),
}: AvatarCarouselProps) {
  const safeInitialIndex = Math.min(initialIndex, Math.max(0, contacts.length - 1));
  const initialOffset = safeInitialIndex * SNAP_INTERVAL;

  const scrollX = useSharedValue(initialOffset);
  const activeIndex = useRef(safeInitialIndex);

  const [sidePadding, setSidePadding] = useState<number | null>(null);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setSidePadding((width - SNAP_INTERVAL) / 2);
  }, []);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
      const safeIndex = Math.max(0, Math.min(index, contacts.length - 1));

      if (safeIndex !== activeIndex.current) {
        activeIndex.current = safeIndex;
        Haptics.selectionAsync();
      }

      onContactChange(contacts[safeIndex]);
    },
    [contacts, onContactChange]
  );

  return (
  <View style={[styles.container, { height }]} onLayout={onContainerLayout}>
    {sidePadding !== null && (
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentOffset={{ x: initialOffset, y: 0 }}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: sidePadding }]}
        style={styles.scrollView}
      >
        {contacts.map((item, index) => (
          <AvatarItem key={item.id} avatar={item.avatar} handle={item.handle} index={index} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>
    )}
  </View>
);

}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  scrollView: { overflow: 'visible' },
  scrollContent: { alignItems: 'flex-start' },
  itemWrapper: {
    width: SNAP_INTERVAL,
    height: ITEM_SIZE + verticalScale(36),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(34),
  },
  avatar: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: ITEM_SIZE / 2 },
  handleText: {
    marginTop: verticalScale(24),
    fontSize: verticalScale(14),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontFamily: 'SpaceGroteskMedium',
  },
});

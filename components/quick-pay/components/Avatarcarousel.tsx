import { verticalScale } from '../constants/styling';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import {
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { AvatarCarouselProps } from '../constants/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_SIZE = 58;
const SPACING = 80;
const SNAP_INTERVAL = ITEM_SIZE + SPACING;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Contact {
  id: string;
  /** Accepts local require() OR remote { uri: string } */
  avatar: ImageSourcePropType | { uri: string };
  handle: string;
  name?: string;
}



// ─── AvatarItem ───────────────────────────────────────────────────────────────

interface AvatarItemProps {
  avatar: Contact['avatar'];
  index: number;
  scrollX: SharedValue<number>;
}

const AvatarItem = React.memo(function AvatarItem({
  avatar,
  handle,
  index,
  scrollX,
}: AvatarItemProps & { handle: string }) {
  const animatedStyle = useAnimatedStyle(() => {
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

    const translateY = interpolate(
      distance,
      [0, SNAP_INTERVAL],
      [0, 8],
      Extrapolation.CLAMP
    );

    return { opacity, transform: [{ scale }, { translateY }] };
  });

  const handleStyle = useAnimatedStyle(() => {
    const position = index * SNAP_INTERVAL;
    const distance = Math.abs(scrollX.value - position);

    const opacity = interpolate(
      distance,
      [0, ITEM_SIZE * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  return (
  <View style={styles.itemWrapper}>
    <Animated.Image source={avatar} style={[styles.avatar, animatedStyle]} />
    <Animated.Text
      style={[styles.handleText, handleStyle]}
      numberOfLines={1}
    >
      {handle}
    </Animated.Text>
  </View>
);
});
// ─── AvatarCarousel ───────────────────────────────────────────────────────────

export default function AvatarCarousel({
  contacts,
  initialIndex = 3,
  onContactChange,
  height = 120,
}: AvatarCarouselProps) {
  const containerWidth = useSharedValue(0);
  const scrollX = useSharedValue(initialIndex * SNAP_INTERVAL);
  const activeIndex = React.useRef(initialIndex);

  const [sidePadding, setSidePadding] = React.useState(
    () => (340 - SNAP_INTERVAL) / 2
  );

  const onLayoutView = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      const w = e.nativeEvent.layout.width;
      containerWidth.value = w;
      setSidePadding((w - SNAP_INTERVAL) / 2);
    },
    []
  );

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
  <View style={[styles.container, { height: height ?? 150 }]} onLayout={onLayoutView}>
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
        contentOffset={{ x: initialIndex * SNAP_INTERVAL, y: 0 }}
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          alignItems: 'flex-start', // ← key
        }}
        style={{ overflow: 'visible' }} // ← key
      >
        {contacts.map((item, index) => (
          <AvatarItem
            key={item.id}
            avatar={item.avatar}
            handle={item.handle}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
    )}
  </View>
);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
  justifyContent: 'center',
  
},

itemWrapper: {
  width: SNAP_INTERVAL,
  height: ITEM_SIZE + 36,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: verticalScale(20)
  
},

avatar: {
  width: ITEM_SIZE,
  height: ITEM_SIZE,
  borderRadius: ITEM_SIZE / 2,
},


handleText: {
  marginTop: 24,
  fontSize: 14,
  color: 'rgba(255,255,255,0.7)',
  textAlign: 'center',
  fontFamily: 'SpaceGroteskMedium'
},


});
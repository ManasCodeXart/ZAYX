import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { verticalScale } from "../constants/scaling";
import type { Coin, CoinPickerProps } from "../constants/types";
import { useAnimatedTheme } from "../hooks/useAnimatedTheme";
import { CoinRow } from "./CoinRow";
import { ThemedSwapIcon } from "./SwapIcon";

const CARD_RADIUS = verticalScale(36);

const MORPH_SPRING = { damping: 20, stiffness: 240, mass: 0.7 } as const;

const SWAP_FADE_DURATION = 120;

const HEADER_ENTER_DELAY = 170;
const HEADER_ENTER_DURATION = 150;

const ROW_ENTER_BASE_DELAY = HEADER_ENTER_DELAY + 40;
const ROW_STAGGER_MS = 25;
const ROW_ENTER_DURATION = 250;
const ROW_ENTER_OFFSET_Y = 9;

const EXIT_CONTENT_DURATION = 120;
const SHAPE_SETTLE_MS = 250;
const INTERACTIVE_DELAY = HEADER_ENTER_DELAY + HEADER_ENTER_DURATION;

const keyExtractor = (item: Coin) => item.symbol;

const COIN_ROW_HEIGHT =
  verticalScale(8) * 2 + verticalScale(34) + verticalScale(1);

const getCoinRowLayout = (_data: unknown, index: number) => ({
  length: COIN_ROW_HEIGHT,
  offset: COIN_ROW_HEIGHT * index,
  index,
});

export function CoinPicker({
  bounds,
  title,
  selectedSymbol,
  coins,
  swapIcon,
  veil,
  themeProgress,
  onSelect,
  onClose,
}: CoinPickerProps) {
  const isClosingRef = useRef(false);
  const [interactive, setInteractive] = useState(false);
  const animatedTheme = useAnimatedTheme(themeProgress);

  const midHeight = bounds.unionHeight / 2;

  const MID_OVERLAP = 1;

  const topHeight = useSharedValue(bounds.topHeight);
  const bottomHeight = useSharedValue(bounds.bottomHeight);
  const seamRadius = useSharedValue(CARD_RADIUS);
  const swapOpacity = useSharedValue(1);

  const contentOpacity = useSharedValue(1);

  const veilOpacity = useSharedValue(0);

  useEffect(() => {
    topHeight.value = withSpring(midHeight + MID_OVERLAP, MORPH_SPRING);
    bottomHeight.value = withSpring(midHeight, MORPH_SPRING);
    seamRadius.value = withSpring(0, MORPH_SPRING);
    swapOpacity.value = withTiming(0, { duration: SWAP_FADE_DURATION });
    const interactiveTimer = setTimeout(() => setInteractive(true), INTERACTIVE_DELAY);
    return () => clearTimeout(interactiveTimer);

  }, []);

  const topHalfStyle = useAnimatedStyle(() => ({
    height: topHeight.value,
    borderBottomLeftRadius: seamRadius.value,
    borderBottomRightRadius: seamRadius.value,
  }));

  const bottomHalfStyle = useAnimatedStyle(() => ({
    height: bottomHeight.value,
    borderTopLeftRadius: seamRadius.value,
    borderTopRightRadius: seamRadius.value,
  }));

  const swapStyle = useAnimatedStyle(() => ({
    opacity: swapOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const veilStyle = useAnimatedStyle(() => ({
    opacity: veilOpacity.value,
  }));

  const beginExit = useCallback(() => {

    contentOpacity.value = withTiming(0, { duration: EXIT_CONTENT_DURATION });

    veilOpacity.value = withTiming(1, { duration: EXIT_CONTENT_DURATION });

    topHeight.value = withDelay(
      EXIT_CONTENT_DURATION,
      withSpring(bounds.topHeight, MORPH_SPRING)
    );

    seamRadius.value = withDelay(
      EXIT_CONTENT_DURATION,
      withSpring(CARD_RADIUS, MORPH_SPRING)
    );

    bottomHeight.value = withDelay(
      EXIT_CONTENT_DURATION,
      withSpring(bounds.bottomHeight, MORPH_SPRING, (finished) => {
        if (finished) runOnJS(onClose)();
      })
    );

    swapOpacity.value = withDelay(
      EXIT_CONTENT_DURATION + SHAPE_SETTLE_MS - SWAP_FADE_DURATION,
      withTiming(1, { duration: SWAP_FADE_DURATION })
    );
  }, [
    bounds,
    onClose,
    bottomHeight,
    contentOpacity,
    seamRadius,
    swapOpacity,
    topHeight,
    veilOpacity,
  ]);

  const handleClosePress = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setInteractive(false);
    beginExit();
  }, [beginExit]);

  const handleSelect = useCallback(
    (coin: Coin) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      setInteractive(false);
      onSelect(coin);
      beginExit();
    },
    [beginExit, onSelect]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Coin; index: number }) => (
      <Animated.View
        entering={FadeInUp.duration(ROW_ENTER_DURATION)
          .delay(ROW_ENTER_BASE_DELAY + index * ROW_STAGGER_MS)
          .easing(Easing.out(Easing.cubic))
          .withInitialValues({ transform: [{ translateY: ROW_ENTER_OFFSET_Y }] })}
      >
        <CoinRow
          coin={item}
          isSelected={item.symbol === selectedSymbol}
          onPress={handleSelect}
          themeProgress={themeProgress}
        />
      </Animated.View>
    ),
    [handleSelect, selectedSymbol, themeProgress]
  );

  return (
    <View style={[styles.union, { height: bounds.unionHeight }]}>
      <Animated.View style={[styles.topHalf, topHalfStyle, animatedTheme.cardStyle]}>
        <Animated.View style={[styles.veilContent, veilStyle]}>
          <Text style={styles.veilLabel}>You pay</Text>
          <Text style={styles.veilAmount} numberOfLines={1}>
            {veil.sendAmount}
          </Text>
          <Text style={styles.veilUsd} numberOfLines={1}>
            {veil.payUsd}
          </Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.bottomHalf, bottomHalfStyle, animatedTheme.cardStyle]}>
        <Animated.View style={[styles.veilContent, veilStyle]}>
          <Text style={styles.veilLabel}>You receive</Text>
          <Text style={styles.veilAmount} numberOfLines={1}>
            {veil.receiveAmount}
          </Text>
          <Text style={styles.veilUsd} numberOfLines={1}>
            {veil.receiveUsd}
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.swapLayer, swapStyle]} pointerEvents="none">
        <Animated.View style={[styles.swapButton, animatedTheme.swapButtonStyle]}>
          {swapIcon ?? (
            <ThemedSwapIcon progress={themeProgress} size={verticalScale(16)} />
          )}
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[styles.overlay, overlayStyle]}
        pointerEvents={interactive ? "auto" : "none"}
      >
        <Animated.View
          entering={FadeIn.duration(HEADER_ENTER_DURATION)
            .delay(HEADER_ENTER_DELAY)
            .easing(Easing.out(Easing.quad))}
          style={styles.headerRow}
        >
          <Animated.Text
            style={[styles.headerTitle, animatedTheme.secondaryTextStyle]}
          >
            {title}
          </Animated.Text>
          <TouchableOpacity onPress={handleClosePress} activeOpacity={0.7} hitSlop={12}>
            <Animated.Text
              style={[styles.closeIcon, animatedTheme.primaryTextStyle]}
            >
              ✕
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        <FlatList
          data={coins}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getCoinRowLayout}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  union: {
    marginBottom: verticalScale(8),
  },
  topHalf: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  bottomHalf: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    overflow: "hidden",
  },
  swapLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  swapButton: {
    width: verticalScale(38),
    height: verticalScale(38),
    borderRadius: verticalScale(19),
    backgroundColor: "#FFFFFF",
    borderWidth: 6,
    borderColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: verticalScale(20),
    paddingVertical: verticalScale(12),

  },

  veilContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: verticalScale(20),
    paddingVertical: verticalScale(18),
    gap: verticalScale(6),
  },
  veilLabel: {
    color: "#888888",
    fontSize: verticalScale(16),
    fontFamily: "SpaceGroteskSemiBold",
    marginBottom: verticalScale(12),
  },
  veilAmount: {
    color: "#BDBDBD",
    fontSize: verticalScale(30),
    fontFamily: "SpaceGroteskMedium",
    padding: 0,
  },
  veilUsd: {
    color: "#D2D2D2",
    fontSize: verticalScale(19),
    fontFamily: "SpaceGroteskMedium",
    marginTop: verticalScale(-4),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(4),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: verticalScale(4),
  },
  headerTitle: {
    color: "#888888",
    fontSize: verticalScale(14),
    fontFamily: "SpaceGroteskSemiBold",
  },
  closeIcon: {
    color: "#111111",
    fontSize: verticalScale(16),
    fontFamily: "SpaceGroteskSemiBold",
    paddingHorizontal: verticalScale(4),
  },
});

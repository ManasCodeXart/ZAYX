import { Image } from "expo-image";
import { memo, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  type SharedValue,
} from "react-native-reanimated";
import { verticalScale } from "../constants/scaling";
import type { Coin } from "../constants/types";
import { useAnimatedTheme } from "../hooks/useAnimatedTheme";
import { getCoinIconUrl } from "../utils/coinIcon";

const QUOTE_UPDATE_FADE_DURATION = 900;

export interface CoinPillProps {
  coin: Coin;
  onPress: () => void;
  themeProgress: SharedValue<number>;
}

export const CoinPill = memo(function CoinPill({
  coin,
  onPress,
  themeProgress,
}: CoinPillProps) {
  const animatedTheme = useAnimatedTheme(themeProgress);

  const iconSource = useMemo(
    () => ({ uri: getCoinIconUrl(coin.symbol) }),
    [coin.symbol]
  );

  const [failedSymbol, setFailedSymbol] = useState<string | null>(null);
  const iconFailed = failedSymbol === coin.symbol;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.pillTouch}>
      <Animated.View
        key={coin.symbol}
        entering={FadeIn.duration(QUOTE_UPDATE_FADE_DURATION).easing(
          Easing.out(Easing.quad)
        )}
        style={[styles.coinPill, animatedTheme.pillStyle]}
        collapsable={false}
      >
        {iconFailed ? (
          <View style={[styles.coinIcon, styles.coinIconFallback]}>
            <Animated.Text
              style={[
                styles.coinIconFallbackLetter,
                animatedTheme.primaryTextStyle,
              ]}
              allowFontScaling={false}
            >
              {coin.symbol.charAt(0)}
            </Animated.Text>
          </View>
        ) : (
          <Image
            source={iconSource}
            style={styles.coinIcon}
            contentFit="cover"
            onError={() => setFailedSymbol(coin.symbol)}
          />
        )}
        <Animated.Text
          style={[styles.coinSymbol, animatedTheme.primaryTextStyle]}
        >
          {coin.symbol}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  pillTouch: {
    flexShrink: 0,
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: verticalScale(20),
    paddingHorizontal: verticalScale(14),
    paddingVertical: verticalScale(10),
    gap: verticalScale(7),
  },
  coinIcon: {
    width: verticalScale(26),
    height: verticalScale(26),
    borderRadius: verticalScale(13),
  },
  coinIconFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4E4E4",
  },
  coinIconFallbackLetter: {
    fontSize: verticalScale(12),
    fontFamily: "SpaceGroteskBold",
    fontWeight: "700",
  },
  coinSymbol: {
    color: "#111111",
    fontSize: verticalScale(15),
    fontFamily: "SpaceGroteskBold",
    fontWeight: "700",
  },
});

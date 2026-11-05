import { Image } from "expo-image";
import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { type SharedValue } from "react-native-reanimated";
import { verticalScale } from "../constants/scaling";
import type { Coin } from "../constants/types";
import { useAnimatedTheme } from "../hooks/useAnimatedTheme";
import { getCoinIconUrl } from "../utils/coinIcon";

interface CoinRowProps {
  coin: Coin;
  isSelected: boolean;
  onPress: (coin: Coin) => void;
  themeProgress: SharedValue<number>;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

function CoinRowComponent({ coin, isSelected, onPress, themeProgress }: CoinRowProps) {
  const animatedTheme = useAnimatedTheme(themeProgress);

  const iconSource = useMemo(
    () => ({ uri: getCoinIconUrl(coin.symbol) }),
    [coin.symbol]
  );

  const [failedSymbol, setFailedSymbol] = useState<string | null>(null);
  const iconFailed = failedSymbol === coin.symbol;
  return (
    <AnimatedTouchableOpacity
      style={[
        styles.row,
        isSelected && styles.rowSelected,
        isSelected && animatedTheme.rowSelectedStyle,
      ]}
      onPress={() => onPress(coin)}
      activeOpacity={0.7}
    >
      {iconFailed ? (
        <View style={[styles.icon, styles.iconFallback]}>
          <Text style={styles.iconFallbackLetter} allowFontScaling={false}>
            {coin.symbol.charAt(0)}
          </Text>
        </View>
      ) : (
        <Image
          source={iconSource}
          style={styles.icon}
          contentFit="cover"
          onError={() => setFailedSymbol(coin.symbol)}
        />
      )}
      <View style={styles.rowText}>
        <Animated.Text
          style={[styles.symbol, animatedTheme.primaryTextStyle]}
          allowFontScaling={false}
        >
          {coin.symbol}
        </Animated.Text>
        <Animated.Text
          style={[styles.name, animatedTheme.secondaryTextStyle]}
          allowFontScaling={false}
        >
          {coin.name}
        </Animated.Text>
      </View>
      {isSelected && (
        <Animated.View style={[styles.checkDot, animatedTheme.checkDotStyle]}>
          <Animated.Text style={[styles.checkmark, animatedTheme.checkmarkTextStyle]}>
            ✓
          </Animated.Text>
        </Animated.View>
      )}
    </AnimatedTouchableOpacity>
  );
}

export const CoinRow = memo(CoinRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8),
    paddingHorizontal: verticalScale(8),
    borderRadius: verticalScale(12),
    marginBottom: verticalScale(1),
  },
  rowSelected: {
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  icon: {
    width: verticalScale(34),
    height: verticalScale(34),
    borderRadius: verticalScale(17),
    marginRight: verticalScale(12),
  },
  iconFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4E4E4",
  },
  iconFallbackLetter: {
    color: "#666666",
    fontSize: verticalScale(14),
    fontWeight: "700",
  },
  rowText: {
    flex: 1,
  },
  symbol: {
    color: "#111111",
    fontSize: verticalScale(14),
    fontWeight: "700",
  },
  name: {
    color: "#888888",
    fontSize: verticalScale(11),
    marginTop: verticalScale(1),
  },
  checkDot: {
    width: verticalScale(20),
    height: verticalScale(20),
    borderRadius: verticalScale(10),
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: verticalScale(10),
    fontWeight: "800",
  },
});

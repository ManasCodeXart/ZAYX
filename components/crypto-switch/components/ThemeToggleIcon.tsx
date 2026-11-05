import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

interface ThemeToggleIconProps {
  isDark: boolean;
  size?: number;
  color?: string;
}

const ICON_CROSSFADE_DURATION = 200;

const SUN_RAYS =
  "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41";
const MOON_PATH = "M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z";

export const ThemeToggleIcon = memo(function ThemeToggleIcon({
  isDark,
  size = 18,
  color = "#111111",
}: ThemeToggleIconProps) {

  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, {
      duration: ICON_CROSSFADE_DURATION,
      easing: Easing.inOut(Easing.quad),
    });
  }, [isDark, progress]);

  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));
  const moonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, sunStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={4}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d={SUN_RAYS}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, moonStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d={MOON_PATH}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
});

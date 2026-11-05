import { memo } from "react";
import Animated, {
  interpolateColor,
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

interface SwapIconProps {
  size?: number;
  color?: string;
}

export function SwapIcon({ size = 16, color = "#FFFFFF" }: SwapIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 7h12M19 7l-4-4M19 7l-4 4M17 17H5M5 17l4 4M5 17l4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PROGRESS_RANGE: number[] = [0, 1];
const STROKE_RANGE: string[] = ["#111111", "#FFFFFF"];

interface ThemedSwapIconProps {
  progress: SharedValue<number>;
  size?: number;
}

export const ThemedSwapIcon = memo(function ThemedSwapIcon({
  progress,
  size = 16,
}: ThemedSwapIconProps) {
  const animatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(progress.value, PROGRESS_RANGE, STROKE_RANGE),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d="M7 7h12M19 7l-4-4M19 7l-4 4M17 17H5M5 17l4 4M5 17l4-4"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={animatedProps}
      />
    </Svg>
  );
});

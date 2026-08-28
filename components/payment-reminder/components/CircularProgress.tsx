import { memo, useEffect, type ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Circle, G, Svg } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CircularProgressProps = {
size: number;
width: number;
fill: number;
tintColor?: string;
backgroundColor?: string;
rotation?: number;
lineCap?: 'butt' | 'round' | 'square';
duration?: number;
style?: StyleProp<ViewStyle>;
children?: ReactNode;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export const CircularProgress = memo(function CircularProgress({
  size,
  width,
  fill,
  tintColor = '#FFFFFF',
  backgroundColor,
  rotation = 0,
  lineCap = 'round',
  duration = 500,
  style,
  children,
}: CircularProgressProps) {
  const radius = (size - width) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamp(fill), {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [fill, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* -90 puts fill=0 at 12 o'clock; `rotation` is extra offset on top of that */}
        <G rotation={rotation - 90} originX={size / 2} originY={size / 2}>
          {backgroundColor && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={width}
              fill="transparent"
            />
          )}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tintColor}
            strokeWidth={width}
            strokeLinecap={lineCap}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );
});

CircularProgress.displayName = 'CircularProgress';

const styles = StyleSheet.create({
  children: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

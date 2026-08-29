// components/AnimatedCounter.tsx

import React, { useEffect, useState } from "react";
import { Text, TextStyle } from "react-native";
import {
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  decimals?: number;
  style?: TextStyle;
};

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 10000,
  delay = 0,
  decimals = 0,
  style,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration })
    );

    const interval = setInterval(() => {
      const current = progress.value * value;

      setDisplayValue(current);

      if (progress.value >= 1) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <Text style={style}>
      {prefix}
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </Text>
  );
}
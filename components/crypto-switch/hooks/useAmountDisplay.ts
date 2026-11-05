import { useEffect } from "react";
import type { SharedValue } from "react-native-reanimated";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { verticalScale } from "../constants/scaling";

const BASE_AMOUNT_FONT_SIZE = verticalScale(30);
const SHRUNK_AMOUNT_FONT_SIZES = {
  sixDigits: verticalScale(30),
  sevenDigits: verticalScale(30),
  eightPlusDigits: verticalScale(30),
} as const;

function computeAmountFontSize(display: string | null): number {
  if (display === null) return BASE_AMOUNT_FONT_SIZE;

  const decimalIndex = display.indexOf(".");
  const integerDigits = decimalIndex === -1 ? display.length : decimalIndex;

  if (integerDigits <= 5) return BASE_AMOUNT_FONT_SIZE;
  if (integerDigits <= 6) return SHRUNK_AMOUNT_FONT_SIZES.sixDigits;
  if (integerDigits <= 7) return SHRUNK_AMOUNT_FONT_SIZES.sevenDigits;
  return SHRUNK_AMOUNT_FONT_SIZES.eightPlusDigits;
}

const FONT_SIZE_TIMING = {
  duration: 180,
  easing: Easing.out(Easing.quad),
} as const;

export function useAmountTypography(value: string | null) {
  const fontSize = useSharedValue(computeAmountFontSize(value));

  useEffect(() => {
    fontSize.value = withTiming(computeAmountFontSize(value), FONT_SIZE_TIMING);
  }, [fontSize, value]);

  const amountStyle = useAnimatedStyle(() => ({
    fontSize: fontSize.value,
  }));

  return { fontSize, amountStyle };
}

export function useAmountCaret(fontSize: SharedValue<number>, isFocused: boolean) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      opacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
    } else {
      opacity.value = withTiming(1);
    }
  }, [isFocused, opacity]);

  const caretStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    height: fontSize.value,
  }));

  return caretStyle;
}

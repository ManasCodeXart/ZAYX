import {
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { DARK_THEME, LIGHT_THEME } from "../constants/theme";

const COLOR_RANGE: number[] = [0, 1];

const BACKGROUND_RANGE: string[] = [
  LIGHT_THEME.background,
  DARK_THEME.background,
];
const CARD_RANGE: string[] = [
  LIGHT_THEME.cardBackground,
  DARK_THEME.cardBackground,
];
const PILL_RANGE: string[] = [
  LIGHT_THEME.pillBackground,
  DARK_THEME.pillBackground,
];
const DIVIDER_RANGE: string[] = [LIGHT_THEME.divider, DARK_THEME.divider];
const PRIMARY_TEXT_RANGE: string[] = [
  LIGHT_THEME.textPrimary,
  DARK_THEME.textPrimary,
];
const SECONDARY_TEXT_RANGE: string[] = [
  LIGHT_THEME.textSecondary,
  DARK_THEME.textSecondary,
];
const SWAP_BG_RANGE: string[] = [
  LIGHT_THEME.swapButtonBackground,
  DARK_THEME.swapButtonBackground,
];
const SWAP_BORDER_RANGE: string[] = [
  LIGHT_THEME.swapButtonBorder,
  DARK_THEME.swapButtonBorder,
];
const CARET_RANGE: string[] = [LIGHT_THEME.caret, DARK_THEME.caret];
const SEND_BG_RANGE: string[] = ["#111111", "#FFFFFF"];
const SEND_TEXT_RANGE: string[] = ["#FFFFFF", "#000000"];

const CHECKMARK_RANGE: string[] = ["#FFFFFF", "#000000"];

export function useAnimatedTheme(progress: SharedValue<number>) {
  const rootStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      BACKGROUND_RANGE
    ),
  }));

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      CARD_RANGE
    ),
  }));

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      PILL_RANGE
    ),
  }));

  const rowSelectedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      PILL_RANGE
    ),
    borderColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      DIVIDER_RANGE
    ),
  }));

  const primaryTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      COLOR_RANGE,
      PRIMARY_TEXT_RANGE
    ),
  }));

  const secondaryTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      COLOR_RANGE,
      SECONDARY_TEXT_RANGE
    ),
  }));

  const swapButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      SWAP_BG_RANGE
    ),
    borderColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      SWAP_BORDER_RANGE
    ),
  }));

  const caretColorStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      CARET_RANGE
    ),
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      SEND_BG_RANGE
    ),
  }));

  const sendTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, COLOR_RANGE, SEND_TEXT_RANGE),
  }));

  const checkDotStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      COLOR_RANGE,
      PRIMARY_TEXT_RANGE
    ),
  }));

  const checkmarkTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, COLOR_RANGE, CHECKMARK_RANGE),
  }));

  return {
    rootStyle,
    cardStyle,
    pillStyle,
    rowSelectedStyle,
    primaryTextStyle,
    secondaryTextStyle,
    swapButtonStyle,
    caretColorStyle,
    sendButtonStyle,
    sendTextStyle,
    checkDotStyle,
    checkmarkTextStyle,
  };
}

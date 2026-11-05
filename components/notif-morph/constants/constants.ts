import { Easing, type EasingFunctionFactory } from "react-native-reanimated";

export const MORPH_DURATION = 600;

export const MORPH_EASING: EasingFunctionFactory = Easing.bezier(
  0.22,
  1,
  0.36,
  1,
);

export const MORPH_SLIDE_DISTANCE = 65;

export const MORPH_COLLAPSED = "collapsed";

export const MORPH_SPRING = {
  damping: 14,
  mass: 0.6,
  stiffness: 220,
} as const;

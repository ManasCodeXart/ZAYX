import { Easing, type EasingFunctionFactory } from "react-native-reanimated";


export const MORPH_DURATION: number = 600;


export const MORPH_EASING: EasingFunctionFactory = Easing.bezier(
  0.22,
  1,
  0.36,
  1,
);


export const MORPH_SLIDE_DISTANCE: number = 65;
export const MORPH_COLLAPSED: string = "collapsed";

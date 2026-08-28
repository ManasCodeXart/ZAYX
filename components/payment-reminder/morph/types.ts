import type { ReactNode } from "react";
import type { EasingFunctionFactory } from "react-native-reanimated";


export interface MorphSize {
  w: number;
  h: number;
}

export type MorphSizeMap = Record<string, MorphSize>;


export type MorphMode = "stack" | "replace";

export interface MorphKeyedRenderItem {
  key: string;
  render: () => ReactNode;
}

export interface UseMorphBoxOptions {
 
  activeKey: string | null;
  
  sizes: MorphSizeMap;
  
  collapsedSize: MorphSize;
  mode?: MorphMode;
  minWidth?: number;
  duration?: number;
  easing?: EasingFunctionFactory;
}

export interface UseMorphContentOptions {
  active: boolean;
  direction?: -1 | 0 | 1;
  duration?: number;
  easing?: EasingFunctionFactory;
  slideDistance?: number;
}

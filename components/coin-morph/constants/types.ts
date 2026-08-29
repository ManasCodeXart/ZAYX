import type { RefObject } from 'react';
import type { Image, ImageSourcePropType, StyleProp, TextStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export interface Coin {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly image: ImageSourcePropType;
}


export type CoinImageRef = RefObject<Image | null>;


export interface CoinOrigin {
  readonly x: number;
  readonly y: number;
}


export interface CoinMorphAnimation {
  readonly overlayOpacity: SharedValue<number>;
  readonly coinScale: SharedValue<number>;
  readonly coinTranslateX: SharedValue<number>;
  readonly coinTranslateY: SharedValue<number>;
  readonly coinSquashY: SharedValue<number>;
  readonly detailOpacity: SharedValue<number>;
}

export type AnimatedCounterProps = Readonly<{
  readonly value: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly duration?: number;
  readonly delay?: number;
  readonly decimals?: number;
  readonly style?: StyleProp<TextStyle>;
}>;
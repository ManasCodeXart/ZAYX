import type { ImageSourcePropType } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { useCardFlip } from '../hooks/useCardFlip';
import type { useCardPhysics } from '../hooks/useCardPhysics';
import type { usePendulum } from '../hooks/usePendulum';
import type { useStrapBow } from '../hooks/useStrapBow';

export interface HangingCardProps {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatarSource: ImageSourcePropType;
  qrCodeSource?: ImageSourcePropType;
  backLogoSource?: ImageSourcePropType;
  frontGradientColors?: [string, string];
  backGradientColors?: [string, string];
  waveBackgroundSource?: object;
}

export interface StrapProps {
  flipAngle: SharedValue<number>;
}

export type UseCardFlipReturn = ReturnType<typeof useCardFlip>;
export type UsePendulumReturn = ReturnType<typeof usePendulum>;
export type UseStrapBowReturn = ReturnType<typeof useStrapBow>;
export type UseCardPhysicsReturn = ReturnType<typeof useCardPhysics>;

import type { SharedValue } from 'react-native-reanimated';
import {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import {
  CARD_PERSPECTIVE,
  FLIP_BAND_END,
  FLIP_BAND_START,
  FLIP_DIR,
  FLIP_FOLLOW_C,
  FLIP_FOLLOW_K,
  FLIP_FULL_DEG,
  FLIP_TARGET_DEG,
} from '../constants/card';

export function useCardFlip(angle: SharedValue<number>) {
  const flipAngle = useSharedValue(0);
  const flipVel = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const dt = Math.max(
      0.001,
      Math.min((frameInfo.timeSincePreviousFrame ?? 16.67) / 1000, 1 / 30),
    );

    const th = angle.value;
    const u = Math.abs(th) / FLIP_FULL_DEG;
    const bandRange = FLIP_BAND_END - FLIP_BAND_START;

    let s = bandRange === 0 ? (u >= FLIP_BAND_END ? 1 : 0) : (u - FLIP_BAND_START) / bandRange;
    s = Math.max(0, Math.min(1, s));
    s = s * s * (3 - 2 * s);

    const target = FLIP_DIR * Math.sign(th) * FLIP_TARGET_DEG * s;

    let f = flipAngle.value;
    let v = flipVel.value;
    const h = dt / 4;

    for (let i = 0; i < 4; i++) {
      const acc = FLIP_FOLLOW_K * (target - f) - FLIP_FOLLOW_C * v;
      v += acc * h;
      f += v * h;
    }

    if (Math.abs(target - f) < 0.05 && Math.abs(v) < 0.5) {
      f = target;
      v = 0;
    }

    flipAngle.value = f;
    flipVel.value = v;
  });

  const cardFlipStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: CARD_PERSPECTIVE }, { rotateY: `${flipAngle.value}deg` }],
  }));

  return { flipAngle, cardFlipStyle };
}

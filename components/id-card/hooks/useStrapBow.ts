import type { SharedValue } from 'react-native-reanimated';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import {
  BOW_C,
  BOW_DRIVE,
  BOW_K,
  BOW_MAX_PX,
  BOW_VEL_REF,
  BOW_VEL_SMOOTH_S,
  FLIP_DIR,
} from '../constants/card';

export function useStrapBow(flipAngle: SharedValue<number>) {
  const bow = useSharedValue(0);
  const bowVel = useSharedValue(0);
  const prevFlip = useSharedValue(0);
  const flipVel = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const dt = Math.max(
      0.001,
      Math.min((frameInfo.timeSincePreviousFrame ?? 16.67) / 1000, 1 / 30),
    );

    const d = flipAngle.value - prevFlip.value;
    const nextPrev = flipAngle.value;

    let fv = flipVel.value;
    fv += (d / dt - fv) * (1 - Math.exp(-dt / BOW_VEL_SMOOTH_S));

    let u = (-FLIP_DIR * fv) / BOW_VEL_REF;
    u = Math.max(-1.5, Math.min(1.5, u));

    let y = bow.value;
    let v = bowVel.value;
    const h = dt / 4;

    for (let i = 0; i < 4; i++) {
      const acc = BOW_DRIVE * u - BOW_K * y - BOW_C * v;
      v += acc * h;
      y += v * h;
      if (Math.abs(y) > BOW_MAX_PX) {
        y = Math.sign(y) * BOW_MAX_PX;
        v = 0;
      }
    }

    if (Math.abs(y) < 0.02 && Math.abs(v) < 0.05 && Math.abs(fv) < 1) {
      y = 0;
      v = 0;
    }

    prevFlip.value = nextPrev;
    flipVel.value = fv;
    bow.value = y;
    bowVel.value = v;
  });

  return { bow };
}

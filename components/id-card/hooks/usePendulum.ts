import { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import {
  BACK_HOLD_S,
  DROP_C,
  DROP_K,
  DROP_KICK,
  DROP_MAX_PX,
  DROP_MAX_UP_PX,
  DROP_MIN_DEG,
  DROP_VEL_REF,
  FLIP_FULL_DEG,
  GRAB_SMOOTH_S,
  HOLD_ANGLE_FRAC,
  HOLD_BLEED_TC,
  HOLD_REARM_FRAC,
  PENDULUM_BOUNCE,
  PENDULUM_C,
  PENDULUM_K,
  PENDULUM_MAX_DEG,
  RETURN_EASE_S,
  TOTAL_H,
} from '../constants/card';

const PIVOT = TOTAL_H / 2;

export function usePendulum() {
  const angle = useSharedValue(0);
  const omega = useSharedValue(0);
  const grabbed = useSharedValue(false);
  const grabTarget = useSharedValue(0);
  const holdLeft = useSharedValue(0);
  const holdDone = useSharedValue(false);
  const easeT = useSharedValue(RETURN_EASE_S);
  const dropY = useSharedValue(0);
  const dropVel = useSharedValue(0);
  const peakAbs = useSharedValue(0);
  const prevAngle = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const dt = Math.max(
      0.001,
      Math.min((frameInfo.timeSincePreviousFrame ?? 16.67) / 1000, 1 / 30),
    );

    let a = angle.value;
    let w = omega.value;
    let hl = holdLeft.value;
    let hd = holdDone.value;
    let et = easeT.value;
    let y = dropY.value;
    let dv = dropVel.value;
    let pk = peakAbs.value;
    let pa = prevAngle.value;

    if (grabbed.value) {
      const prev = a;
      a += (grabTarget.value - a) * (1 - Math.exp(-dt / GRAB_SMOOTH_S));
      w = (a - prev) / dt;
      hl = 0;
      hd = false;
      et = RETURN_EASE_S;
    } else {
      const holdAngle = FLIP_FULL_DEG * HOLD_ANGLE_FRAC;

      if (!hd && hl <= 0 && Math.abs(a) >= holdAngle && a * w <= 0) {
        hl = BACK_HOLD_S;
        hd = true;
      }

      if (Math.abs(a) < holdAngle * HOLD_REARM_FRAC) {
        hd = false;
      }

      if (hl > 0) {
        w *= Math.exp(-dt / HOLD_BLEED_TC);
        a += w * dt;
        hl -= dt;
        if (hl <= 0) {
          hl = 0;
          et = 0;
        }
      } else {
        et = Math.min(et + dt, RETURN_EASE_S);
        const e = et / RETURN_EASE_S;
        const kScale = e * e * (3 - 2 * e);
        const h = dt / 4;

        for (let i = 0; i < 4; i++) {
          const acc = -PENDULUM_K * kScale * a - PENDULUM_C * w;
          w += acc * h;
          a += w * h;
          if (Math.abs(a) > PENDULUM_MAX_DEG) {
            a = Math.sign(a) * PENDULUM_MAX_DEG;
            if (Math.sign(w) === Math.sign(a)) {
              w *= PENDULUM_BOUNCE;
            }
          }
        }

        if (Math.abs(a) < 0.02 && Math.abs(w) < 0.05) {
          a = 0;
          w = 0;
        }
      }
    }

    if (!grabbed.value) {
      pk = Math.max(pk, Math.abs(a));
      const crossed = (pa > 0 && a <= 0) || (pa < 0 && a >= 0);
      if (crossed) {
        if (pk >= DROP_MIN_DEG) {
          let u = Math.abs(w) / DROP_VEL_REF;
          u = Math.max(0.5, Math.min(1.5, u));
          dv += DROP_KICK * u;
        }
        pk = 0;
      }
    } else {
      pk = 0;
    }
    pa = a;

    {
      const h = dt / 4;
      for (let i = 0; i < 4; i++) {
        const acc = -DROP_K * y - DROP_C * dv;
        dv += acc * h;
        y += dv * h;
        y = Math.max(-DROP_MAX_UP_PX, Math.min(DROP_MAX_PX, y));
      }

      if (Math.abs(y) < 0.02 && Math.abs(dv) < 0.5) {
        y = 0;
        dv = 0;
      }
    }

    angle.value = a;
    omega.value = w;
    holdLeft.value = hl;
    holdDone.value = hd;
    easeT.value = et;
    dropY.value = y;
    dropVel.value = dv;
    peakAbs.value = pk;
    prevAngle.value = pa;
  });

  const pendulumStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -PIVOT },
      { rotateZ: `${-angle.value}deg` },
      { scaleY: 1 + dropY.value / TOTAL_H },
      { translateY: PIVOT },
    ],
  }));

  return { angle, omega, grabbed, grabTarget, pendulumStyle };
}

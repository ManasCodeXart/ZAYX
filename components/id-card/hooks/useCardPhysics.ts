import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { DRAG_PX_PER_DEG, PENDULUM_MAX_DEG, RELEASE_OMEGA_MAX } from '../constants/card';
import { useCardFlip } from './useCardFlip';
import { usePendulum } from './usePendulum';

export function useCardPhysics() {
  const { angle, omega, grabbed, grabTarget, pendulumStyle } = usePendulum();
  const { flipAngle, cardFlipStyle } = useCardFlip(angle);

  const startAngle = useSharedValue(0);
  const startTx = useSharedValue(0);

  const gesture = Gesture.Pan()
    .minDistance(6)
    .onStart((e) => {
      startAngle.value = angle.value;
      startTx.value = e.translationX;
      grabTarget.value = angle.value;
      grabbed.value = true;
    })
    .onUpdate((e) => {
      const raw = startAngle.value + (e.translationX - startTx.value) / DRAG_PX_PER_DEG;
      grabTarget.value = Math.max(-PENDULUM_MAX_DEG, Math.min(PENDULUM_MAX_DEG, raw));
    })
    .onEnd((e) => {
      omega.value = Math.max(
        -RELEASE_OMEGA_MAX,
        Math.min(RELEASE_OMEGA_MAX, e.velocityX / DRAG_PX_PER_DEG),
      );
      grabbed.value = false;
    })
    .onFinalize(() => {
      if (grabbed.value) {
        grabbed.value = false;
      }
    });

  return { gesture, pendulumStyle, cardFlipStyle, flipAngle };
}

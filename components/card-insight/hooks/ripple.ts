import { useClock, vec } from '@shopify/react-native-skia'
import { Gesture } from 'react-native-gesture-handler'
import { useDerivedValue, useSharedValue } from 'react-native-reanimated'
import type { UseRippleParams } from '../constants/types'

const FADE_OUT_START_RATIO = 0.55

const useRipple = (options: UseRippleParams) => {
  const { amplitude, decay, duration, frequency, height, speed, width } =
    options
  const clock = useClock()
  const touchX = useSharedValue(width / 2)
  const touchY = useSharedValue(height / 2)
  const touchStartTime = useSharedValue(-100000)

  const elapsedTime = useDerivedValue(() => {
    return (clock.value - touchStartTime.value) / 1000
  }, [clock, touchStartTime])

  const uniforms = useDerivedValue(() => {
    const elapsed = elapsedTime.value
    const isActive = elapsed > 0 && elapsed < duration

    return {
      u_origin: vec(touchX.value, touchY.value),
      u_time: isActive ? elapsed : 0,
      u_amplitude: amplitude,
      u_frequency: frequency,
      u_decay: decay,
      u_speed: speed,
    }
  }, [
    touchX,
    touchY,
    elapsedTime,
    amplitude,
    frequency,
    decay,
    speed,
    duration,
  ])

  const intensity = useDerivedValue(() => {
    const elapsed = elapsedTime.value
    if (elapsed <= 0 || elapsed >= duration) return 0

    const fadeOutStart = duration * FADE_OUT_START_RATIO
    if (elapsed < fadeOutStart) return 1

    const t = Math.min(1, (elapsed - fadeOutStart) / (duration - fadeOutStart))
    const smoothed = t * t * (3 - 2 * t)
    return 1 - smoothed
  }, [elapsedTime, duration])

  const tap = Gesture.Tap().onStart((event) => {
    touchX.value = event.x
    touchY.value = event.y
    touchStartTime.value = clock.value
  })

  const trigger = (x?: number, y?: number) => {
    'worklet'
    touchX.value = x ?? width / 2
    touchY.value = y ?? height / 2
    touchStartTime.value = clock.value
  }

  return { uniforms, tap, trigger, intensity }
}

export { useRipple }

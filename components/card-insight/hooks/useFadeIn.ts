import { useEffect } from 'react'
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { CARD_REVEAL_FADE_DURATION } from '../constants/card3d'


export const useFadeIn = (visible: boolean, delayMs = 0) => {
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (!visible) {
      opacity.value = 0
      return
    }

    const animation = withTiming(1, {
      duration: CARD_REVEAL_FADE_DURATION,
      easing: Easing.out(Easing.ease),
    })

    opacity.value = delayMs > 0 ? withDelay(delayMs, animation) : animation
  }, [visible, delayMs])

  return useAnimatedStyle(() => ({ opacity: opacity.value }))
}
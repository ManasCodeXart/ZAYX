import * as Haptics from 'expo-haptics'
import { useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { findNearestPointIndex } from '../../utils/geometry'
import {
  BACKDROP_FADE_IN_MS,
  BACKDROP_FADE_OUT_MS,
  BACKDROP_MAX_OPACITY,
  DEFAULT_HIT_RADIUS,
  DISMISS_DURATION_MS,
  HOVER_HAPTIC_STYLE,
  REVEAL_DURATION_MS,
  REVEAL_STAGGER_MS,
  SELECT_HAPTIC_STYLE,
} from '../constants'
import type { CoinPosition, UseCoinGestureParams, UseCoinGestureResult } from '../constants/types'

const REVEAL_EASING = Easing.bezier(0.16, 1, 0.3, 1)
const DISMISS_EASING = Easing.in(Easing.ease)

function triggerHaptic(style: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') return
  Haptics.impactAsync(style)
}



export function useCoinGesture({
  coins,
  hitRadius = DEFAULT_HIT_RADIUS,
  hapticsEnabled = true,
  onSelect,
  onActiveChange,
}: UseCoinGestureParams): UseCoinGestureResult {
  const [activeCoinId, setActiveCoinId] = useState<string | null>(null)

  const activeIndex = useSharedValue(-1)
  const revealProgress = useSharedValue<number[]>(coins.map(() => 0))
  const backdropOpacity = useSharedValue(0)
  const coinPositions = useSharedValue(coins.map((coin) => coin.position))
  const buttonLayout = useSharedValue<CoinPosition>({ x: 0, y: 0 })

  useEffect(() => {
    coinPositions.value = coins.map((coin) => coin.position)
  }, [coins])

  useAnimatedReaction(
    () => activeIndex.value,
    (current, previous) => {
      if (current === previous) return

      runOnJS(setActiveCoinId)(current === -1 ? null : coins[current]?.id ?? null)

      if (current !== -1 && hapticsEnabled) {
        runOnJS(triggerHaptic)(HOVER_HAPTIC_STYLE)
      }
    },
    [coins, hapticsEnabled]
  )


  const gesture = useMemo(() => {
    function animateReveal(target: 0 | 1) {
      'worklet'
      revealProgress.value = revealProgress.value.map((_, index) =>
        target === 1
          ? withDelay(
            index * REVEAL_STAGGER_MS,
            withTiming(1, { duration: REVEAL_DURATION_MS, easing: REVEAL_EASING })
          )
          : withTiming(0, { duration: DISMISS_DURATION_MS, easing: DISMISS_EASING })
      )
    }

    function resetGesture() {
      'worklet'
      animateReveal(0)
      backdropOpacity.value = withTiming(0, { duration: BACKDROP_FADE_OUT_MS })
      if (onActiveChange) runOnJS(onActiveChange)(false)
      activeIndex.value = -1
    }

    function findHitIndex(touchX: number, touchY: number) {
      'worklet'
      return findNearestPointIndex(
        coinPositions.value,
        buttonLayout.value,
        { x: touchX, y: touchY },
        hitRadius
      )
    }

    return Gesture.Pan()
      .onBegin(() => {
        animateReveal(1)
        backdropOpacity.value = withTiming(BACKDROP_MAX_OPACITY, { duration: BACKDROP_FADE_IN_MS })
        if (onActiveChange) runOnJS(onActiveChange)(true)
      })
      .onUpdate((event) => {
        const hit = findHitIndex(event.absoluteX, event.absoluteY)
        if (hit !== activeIndex.value) activeIndex.value = hit
      })

      .onEnd((event) => {
        const hit = findHitIndex(event.absoluteX, event.absoluteY)
        if (hit === -1) return

        if (hapticsEnabled) runOnJS(triggerHaptic)(SELECT_HAPTIC_STYLE)
        runOnJS(onSelect)(coins[hit])
      })
      .onFinalize(() => {
        resetGesture()
      })

  }, [coins, hitRadius, hapticsEnabled, onSelect, onActiveChange])

  return { gesture, activeIndex, activeCoinId, revealProgress, backdropOpacity, buttonLayout }
}

import { memo, useEffect, useRef, useState } from 'react'
import { Text } from 'react-native'
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import type { AnimatedCounterProps } from '../constants/types'

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 3000
const DEFAULT_DELAY = 0
const DEFAULT_DECIMALS = 0

// ─── Component ──────────────────────────────────────────────────────────────

const AnimatedCounter = memo(function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = DEFAULT_DURATION,
  delay = DEFAULT_DELAY,
  decimals = DEFAULT_DECIMALS,
  style,
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(value)
  const [displayValue, setDisplayValue] = useState(value)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      animatedValue.value = value
      setDisplayValue(value)
      return
    }

    animatedValue.value = withDelay(
      delay,
      withTiming(value, { duration, easing: Easing.out(Easing.cubic) }),
    )
  }, [value, duration, delay])

  useAnimatedReaction(
    () => animatedValue.value,
    (current, previous) => {
      const scale = 10 ** decimals
      const hasVisibleChange =
        previous === null || Math.round(current * scale) !== Math.round(previous * scale)

      if (hasVisibleChange) runOnJS(setDisplayValue)(current)
    },
    [decimals],
  )

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <Text style={style}>
      {prefix}
      {formatted}
      {suffix}
    </Text>
  )
})

AnimatedCounter.displayName = 'AnimatedCounter'

export default AnimatedCounter
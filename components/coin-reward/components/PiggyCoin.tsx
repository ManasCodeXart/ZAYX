import { useEffect } from 'react'
import { Image, StyleSheet } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  COIN_ABSORB_DURATION,
  COIN_FALL_DURATION,
  COIN_SIZE,
  COIN_SPAWN_Y,
} from '../constants/Constants'
import { GravityCoinProps } from '../constants/types'

// ─── Component ────────────────────────────────────────────────────────────────

const Coin = ({ id, slotX, slotY, offsetX, delay, onLanded }: GravityCoinProps) => {

  const translateX = useSharedValue(slotX + offsetX)
  const translateY = useSharedValue(COIN_SPAWN_Y)
  const rotateZ    = useSharedValue(0)
  const rotateY    = useSharedValue(0)
  const scale      = useSharedValue(0.6)   // spawn small, grow as it falls
  const opacity    = useSharedValue(0)     // fade in on spawn

  useEffect(() => {
    const start = () => {

      // ── Fade + scale in on spawn ─────────────────────────────────────────
      opacity.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) })
      scale.value   = withTiming(1, { duration: 180, easing: Easing.out(Easing.back(1.4)) })

      // ── Y-axis flip — coin tumbling face ─────────────────────────────────
      rotateY.value = withRepeat(
        withTiming(180, { duration: 280, easing: Easing.inOut(Easing.sin) }),
        Math.ceil(COIN_FALL_DURATION / 280),
        false,
      )

      // ── Gentle Z tilt — organic, not mechanical ───────────────────────────
      const zDir = offsetX >= 0 ? 1 : -1
      rotateZ.value = withSequence(
        withTiming(zDir * 14, {
          duration: COIN_FALL_DURATION * 0.6,
          easing: Easing.out(Easing.sin),
        }),
        withTiming(zDir * 6, {
          duration: COIN_FALL_DURATION * 0.4,
          easing: Easing.in(Easing.sin),
        }),
      )

      // ── X drift — spring at the end so it snaps into slot naturally ───────
      translateX.value = withSequence(
        withTiming(slotX + offsetX * 0.3, {
          duration: COIN_FALL_DURATION * 0.7,
          easing: Easing.out(Easing.quad),
        }),
        withSpring(slotX, {
          damping: 18,
          stiffness: 160,
          mass: 0.6,
        }),
      )

      // ── Gravity fall ──────────────────────────────────────────────────────
      translateY.value = withTiming(
        slotY,
        {
          duration: COIN_FALL_DURATION,
          easing: Easing.in(Easing.quad),
        },
        (finished) => {
          if (!finished) return

          // ── Absorb — scale + fade out together, single callback ──────────
          scale.value = withTiming(0, {
            duration: COIN_ABSORB_DURATION,
            easing: Easing.in(Easing.quad),
          })

          opacity.value = withTiming(
            0,
            { duration: COIN_ABSORB_DURATION, easing: Easing.in(Easing.quad) },
            (done) => {
              if (done) runOnJS(onLanded)(id)
            },
          )
        },
      )
    }

    const timer = setTimeout(start, delay)
    return () => clearTimeout(timer)
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: COIN_SIZE,
    height: COIN_SIZE,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value - COIN_SIZE / 2 },
      { translateY: translateY.value - COIN_SIZE / 2 },
      { rotateY: `${rotateY.value}deg` },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }))

  return (
    <Animated.View style={animStyle}>
      <Image
        source={require('../assets/images/coinPig.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  )
}

export default Coin

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  image: {
    width: COIN_SIZE,
    height: COIN_SIZE,
  },
})
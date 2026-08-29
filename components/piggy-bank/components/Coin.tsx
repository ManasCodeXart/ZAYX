import { memo, useEffect } from 'react'
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
} from '../constants/tuning'
import type { GravityCoinProps } from '../constants/types'



const DEFAULT_COIN_SOURCE = require('../assets/images/Coin.png')

const COIN_HALF_SIZE = COIN_SIZE / 2

const SPAWN_SCALE_FROM = 0.6
const SPAWN_FADE_IN_DURATION = 120
const SPAWN_SCALE_IN_DURATION = 180
const SPAWN_SCALE_OVERSHOOT = 1.4

const FLIP_DURATION = 280

const TILT_PRIMARY_DEGREES = 14
const TILT_PRIMARY_DURATION_RATIO = 0.6
const TILT_SECONDARY_DEGREES = 6
const TILT_SECONDARY_DURATION_RATIO = 0.4

const DRIFT_DURATION_RATIO = 0.7
const DRIFT_RESIDUAL_RATIO = 0.3
const SLOT_SPRING_CONFIG = { damping: 18, stiffness: 160, mass: 0.6 }



const Coin = memo(function Coin({
  id,
  slotX,
  slotY,
  offsetX,
  delay,
  coinSource = DEFAULT_COIN_SOURCE,
  onLanded,
}: GravityCoinProps) {
  const translateX = useSharedValue(slotX + offsetX)
  const translateY = useSharedValue(COIN_SPAWN_Y)
  const rotateZ = useSharedValue(0)
  const rotateY = useSharedValue(0)
  const scale = useSharedValue(SPAWN_SCALE_FROM)
  const opacity = useSharedValue(0)

  useEffect(() => {
    const animateSpawn = () => {
      opacity.value = withTiming(1, {
        duration: SPAWN_FADE_IN_DURATION,
        easing: Easing.out(Easing.quad),
      })
      scale.value = withTiming(1, {
        duration: SPAWN_SCALE_IN_DURATION,
        easing: Easing.out(Easing.back(SPAWN_SCALE_OVERSHOOT)),
      })
    }

    const animateTumble = () => {
      rotateY.value = withRepeat(
        withTiming(180, { duration: FLIP_DURATION, easing: Easing.inOut(Easing.sin) }),
        Math.ceil(COIN_FALL_DURATION / FLIP_DURATION),
        false,
      )
    }

    const animateTilt = () => {
      const direction = offsetX >= 0 ? 1 : -1
      rotateZ.value = withSequence(
        withTiming(direction * TILT_PRIMARY_DEGREES, {
          duration: COIN_FALL_DURATION * TILT_PRIMARY_DURATION_RATIO,
          easing: Easing.out(Easing.sin),
        }),
        withTiming(direction * TILT_SECONDARY_DEGREES, {
          duration: COIN_FALL_DURATION * TILT_SECONDARY_DURATION_RATIO,
          easing: Easing.in(Easing.sin),
        }),
      )
    }

    const animateDrift = () => {
      translateX.value = withSequence(
        withTiming(slotX + offsetX * DRIFT_RESIDUAL_RATIO, {
          duration: COIN_FALL_DURATION * DRIFT_DURATION_RATIO,
          easing: Easing.out(Easing.quad),
        }),
        withSpring(slotX, SLOT_SPRING_CONFIG),
      )
    }

    const animateFallAndAbsorb = () => {
      translateY.value = withTiming(
        slotY,
        { duration: COIN_FALL_DURATION, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (!finished) return

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

    const timer = setTimeout(() => {
      animateSpawn()
      animateTumble()
      animateTilt()
      animateDrift()
      animateFallAndAbsorb()
    }, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const coinStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: COIN_SIZE,
    height: COIN_SIZE,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value - COIN_HALF_SIZE },
      { translateY: translateY.value - COIN_HALF_SIZE },
      { rotateY: `${rotateY.value}deg` },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }))

  return (
    <Animated.View style={coinStyle}>
      <Image source={coinSource} style={styles.image} resizeMode="contain" />
    </Animated.View>
  )
})

Coin.displayName = 'Coin'

export default Coin



const styles = StyleSheet.create({
  image: {
    width: COIN_SIZE,
    height: COIN_SIZE,
  },
})
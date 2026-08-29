import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { CoinFace, CoinFlipProps } from '@/constants/types'
import Coin, { COIN_SIZE } from '../components/Coin'

const DRAG_SENSITIVITY_X   = 0.55
const DRAG_SENSITIVITY_Y   = 0.38
const MAX_TILT_X           = 40
const VELOCITY_SPIN_FACTOR = 0.003
const MIN_SPINS            = 3
const MAX_SPINS            = 9
const SETTLE_DURATION      = 2200
const TILT_RETURN_RATIO    = 0.55
const VELOCITY_THRESHOLD   = 80
const TRANSLATION_THRESHOLD = 15
const SCALE_PRESSED        = 0.93
const COIN_PERSPECTIVE     = 900
const SCALE_SPRING      = { damping: 14, stiffness: 200, mass: 0.6 }
const TILT_RESET_SPRING = { damping: 12, stiffness: 150 }

const buildSettleTarget = (
  currentRotation: number,
  face: CoinFace,
  velocityX: number,
): number => {
  'worklet'
  const velocitySpins = Math.abs(velocityX) * VELOCITY_SPIN_FACTOR
  const totalSpins    = Math.min(MAX_SPINS, Math.max(MIN_SPINS, Math.round(velocitySpins) + MIN_SPINS))
  const faceOffset    = face === 'heads' ? 0 : 180
  const base          = Math.ceil(currentRotation / 360) * 360
  return base + totalSpins * 360 + faceOffset
}

const isBackFacing = (rotation: number): boolean => {
  'worklet'
  const normalized = ((rotation % 360) + 360) % 360
  return normalized > 90 && normalized < 270
}

const CoinFlip = ({ onResult }: CoinFlipProps) => {
  const rotateY      = useSharedValue(0)
  const rotateX      = useSharedValue(0)
  const savedRotateY = useSharedValue(0)
  const savedRotateX = useSharedValue(0)

  const scale      = useSharedValue(1)
  const isSpinning = useSharedValue(false)

  const handleLanded = useCallback(
    (face: CoinFace) => {
      onResult?.(face)
    },
    [onResult],
  )

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          if (isSpinning.value) return
          savedRotateY.value = rotateY.value
          savedRotateX.value = rotateX.value
          scale.value = withSpring(SCALE_PRESSED, SCALE_SPRING)
        })
        .onUpdate((e) => {
          if (isSpinning.value) return
          rotateY.value = savedRotateY.value + e.translationX * DRAG_SENSITIVITY_X
          const rawTilt = savedRotateX.value - e.translationY * DRAG_SENSITIVITY_Y
          rotateX.value = Math.max(-MAX_TILT_X, Math.min(MAX_TILT_X, rawTilt))
        })
        .onEnd((e) => {
          if (isSpinning.value) return

          const hasMomentum =
            Math.abs(e.velocityX) > VELOCITY_THRESHOLD ||
            Math.abs(e.velocityY) > VELOCITY_THRESHOLD ||
            Math.abs(e.translationX) > TRANSLATION_THRESHOLD ||
            Math.abs(e.translationY) > TRANSLATION_THRESHOLD

          if (!hasMomentum) {
            scale.value = withSpring(1, SCALE_SPRING)
            rotateX.value = withSpring(0, TILT_RESET_SPRING)
            return
          }

          isSpinning.value = true
          scale.value = withSpring(1, SCALE_SPRING)

          const face: CoinFace = Math.random() > 0.5 ? 'heads' : 'tails'
          const targetRotateY = buildSettleTarget(rotateY.value, face, e.velocityX)

          rotateY.value = withTiming(
            targetRotateY,
            { duration: SETTLE_DURATION, easing: Easing.out(Easing.exp) },
            (finished) => {
              if (finished) {
                isSpinning.value = false
                runOnJS(handleLanded)(face)
              }
            },
          )

          rotateX.value = withTiming(0, {
            duration: SETTLE_DURATION * TILT_RETURN_RATIO,
            easing: Easing.out(Easing.quad),
          })
        }),
    [handleLanded],
  )

  const coinContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const headsStyle = useAnimatedStyle(() => {
    const hidden = isBackFacing(rotateY.value)
    return {
      opacity: hidden ? 0 : 1,
      transform: [
        { perspective: COIN_PERSPECTIVE },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    }
  })

  const tailsStyle = useAnimatedStyle(() => {
    const hidden = isBackFacing(rotateY.value)
    return {
      opacity: hidden ? 1 : 0,
      transform: [
        { perspective: COIN_PERSPECTIVE },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value + 180}deg` },
      ],
    }
  })

  return (
    <View style={styles.screen}>
      <Animated.Text style={styles.instruction}>
        {'Flip the Coin to\nReveal Your Reward'}
      </Animated.Text>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.coinWrapper, coinContainerStyle]}>
          <Animated.View style={[styles.face, headsStyle]}>
            <Coin face="heads" />
          </Animated.View>
          <Animated.View style={[styles.face, tailsStyle]}>
            <Coin face="tails" />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

export default CoinFlip

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  coinWrapper: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
  },
})
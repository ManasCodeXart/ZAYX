import * as Haptics from 'expo-haptics'
import { forwardRef, memo, useImperativeHandle } from 'react'
import { Image, StyleSheet } from 'react-native'
import Animated, {
  measure,
  runOnJS,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  JIGGLE_DEGREES,
  JIGGLE_DURATION,
  PIGGY_HEIGHT,
  SLOT_OFFSET_RATIO,
} from '../constants/tuning'
import type { PiggyBankProps, PiggyBankRef } from '../constants/types'
import { fireHaptic } from '../utils/haptics'



const BULGE_SCALE = 1.06
const BULGE_DURATION = 120
const SETTLE_DURATION = 200
const JIGGLE_DECAY_RATIO = 0.6

const PROUD_SCALE = 1.12
const PROUD_PUFF_DURATION = 180
const PROUD_SPRING_CONFIG = { damping: 6, stiffness: 120, mass: 0.8 }



const PiggyBank = memo(
  forwardRef<PiggyBankRef, PiggyBankProps>(function PiggyBank(
    { source, size, onSlotMeasured, hapticsEnabled = true },
    ref,
  ) {
    const containerRef = useAnimatedRef<Animated.View>()
    const rotate = useSharedValue(0)
    const scale = useSharedValue(1)

    useImperativeHandle(
      ref,
      () => ({
        jiggle: () => {
          rotate.value = withSequence(
            withTiming(-JIGGLE_DEGREES, { duration: JIGGLE_DURATION }),
            withTiming(JIGGLE_DEGREES, { duration: JIGGLE_DURATION }),
            withTiming(-JIGGLE_DEGREES * JIGGLE_DECAY_RATIO, { duration: JIGGLE_DURATION }),
            withTiming(JIGGLE_DEGREES * JIGGLE_DECAY_RATIO, { duration: JIGGLE_DURATION }),
            withTiming(0, { duration: JIGGLE_DURATION }),
          )
          scale.value = withSequence(
            withTiming(BULGE_SCALE, { duration: BULGE_DURATION }),
            withTiming(1, { duration: SETTLE_DURATION }),
          )

          if (hapticsEnabled) {
            fireHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
          }
        },
        proudPuff: () => {
          scale.value = withSequence(
            withTiming(PROUD_SCALE, { duration: PROUD_PUFF_DURATION }),
            withSpring(1, PROUD_SPRING_CONFIG),
          )

          if (hapticsEnabled) {
            fireHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
          }
        },
      }),
      [rotate, scale, hapticsEnabled],
    )

    const handleLayout = () => {
      runOnUI(() => {
        'worklet'
        const layout = measure(containerRef)
        if (layout === null) return
        const slotX = layout.pageX + layout.width / 2
        const slotY = layout.pageY + layout.height * SLOT_OFFSET_RATIO
        runOnJS(onSlotMeasured)(slotX, slotY)
      })()
    }

    const containerStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
    }))

    return (
      <Animated.View
        ref={containerRef}
        style={[styles.container, containerStyle]}
        onLayout={handleLayout}
      >
        <Image
          source={source}
          style={{ width: size, height: PIGGY_HEIGHT }}
          resizeMode="contain"
        />
      </Animated.View>
    )
  }),
)

PiggyBank.displayName = 'PiggyBank'

export default PiggyBank



const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
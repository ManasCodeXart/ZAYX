import { forwardRef, useImperativeHandle } from 'react'
import { Image, StyleSheet } from 'react-native'
import Animated, {
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
  SLOT_OFFSET_RATIO
} from '../constants/Constants'
import { PiggyBankProps, PiggyBankRef } from '../constants/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const BULGE_SCALE    = 1.06   // per-coin pulse
const PROUD_SCALE    = 1.12   // final puff peak
const BULGE_DURATION = 120    // ms — fast in
const SETTLE_DURATION = 200   // ms — ease back to 1.0

// ─── Component ────────────────────────────────────────────────────────────────

const PiggyBank = forwardRef<PiggyBankRef, PiggyBankProps>(
  ({ source, size, onSlotMeasured }, ref) => {
    const rotate = useSharedValue(0)
    const scale  = useSharedValue(1)

    useImperativeHandle(ref, () => ({

      // Called on every coin land — subtle belly pulse
      jiggle: () => {
        // Rotate
        rotate.value = withSequence(
          withTiming(-JIGGLE_DEGREES,       { duration: JIGGLE_DURATION }),
          withTiming( JIGGLE_DEGREES,       { duration: JIGGLE_DURATION }),
          withTiming(-JIGGLE_DEGREES * 0.6, { duration: JIGGLE_DURATION }),
          withTiming( JIGGLE_DEGREES * 0.6, { duration: JIGGLE_DURATION }),
          withTiming(0,                     { duration: JIGGLE_DURATION }),
        )

        // Belly pulse — quick puff then settle
        scale.value = withSequence(
          withTiming(BULGE_SCALE, { duration: BULGE_DURATION }),
          withTiming(1.0,         { duration: SETTLE_DURATION }),
        )
      },

      // Called once after all coins land — proud puff
      proudPuff: () => {
        scale.value = withSequence(
          withTiming(PROUD_SCALE, { duration: 180 }),
          withSpring(1.0, {
            damping:   6,
            stiffness: 120,
            mass:      0.8,
          }),
        )
      },

    }))

    const handleLayout = (event: any) => {
      event.target.measure(
        (_x: number, _y: number, _w: number, _h: number, pageX: number, pageY: number) => {
          const slotX = pageX + _w / 2
          const slotY = pageY + _h * SLOT_OFFSET_RATIO
          onSlotMeasured(slotX, slotY)
        },
      )
    }

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
    }))

    return (
      <Animated.View style={[styles.container, animatedStyle]} onLayout={handleLayout}>
        <Image
          source={source}
          style={[styles.image, { width: size, height: PIGGY_HEIGHT }]}
          resizeMode="contain"
        />
      </Animated.View>
    )
  },
)

PiggyBank.displayName = 'PiggyBank'

export default PiggyBank

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {},
})
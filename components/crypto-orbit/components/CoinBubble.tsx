import { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated'

import { verticalScale } from '../../utils/scaling'
import {
  ACTIVE_SCALE_MULTIPLIER,
  COIN_SPRING_CONFIG,
  GLOW_INNER_ALPHA_HEX
} from '../constants'
import type { Coin } from '../constants/types'

export interface CoinBubbleProps {
  readonly coin: Coin
  readonly index: number
  readonly activeIndex: SharedValue<number>
  readonly revealProgress: SharedValue<number[]>
}

const COIN_SIZE = verticalScale(64)
const GLOW_INNER_SIZE = COIN_SIZE * 1.2


function CoinBubble({ coin, index, activeIndex, revealProgress }: CoinBubbleProps) {
  const progress = useDerivedValue(() => revealProgress.value[index] ?? 0)
  const isActive = useDerivedValue(() => activeIndex.value === index)
  const activeScale = useDerivedValue(() =>
    withSpring(isActive.value ? ACTIVE_SCALE_MULTIPLIER : 1, COIN_SPRING_CONFIG)
  )

  const bubbleStyle = useAnimatedStyle(() => {
    const revealScale = interpolate(progress.value, [0, 1], [0.4, 1])
    return {
      opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, coin.position.x]) },
        { translateY: interpolate(progress.value, [0, 1], [0, coin.position.y]) },
        { scale: revealScale * activeScale.value },
      ],
    }
  })

  const glowStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isActive.value ? progress.value : 0, COIN_SPRING_CONFIG),
  }))

  return (
    <Animated.View style={[styles.bubble, bubbleStyle]}>
      
      <Animated.View
        style={[
          styles.glowInner,
          { backgroundColor: `${coin.glowColor}${GLOW_INNER_ALPHA_HEX}`, shadowColor: coin.glowColor },
          glowStyle,
        ]}
      />
      <View style={styles.iconContainer}>
        <Image source={coin.icon} style={styles.icon} resizeMode="contain" />
      </View>
    </Animated.View>
  )
}

export default memo(CoinBubble)

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width: COIN_SIZE,
    height: COIN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    position: 'absolute',
    width: GLOW_INNER_SIZE,
    height: GLOW_INNER_SIZE,
    borderRadius: GLOW_INNER_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: verticalScale(14),
  },
  iconContainer: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: COIN_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
})
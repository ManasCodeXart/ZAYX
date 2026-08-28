import { CARD_BORDER_RADIUS, CARD_HEIGHT, CARD_WIDTH } from '../constants/card3d'
import { verticalScale } from '../constants/scaling'
import { useCardFlipGesture } from '../hooks/useCardFlipGesture'
import { StyleSheet } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { RippleOverlay, } from '../components/SkiaRipple'
import type { Card3DProps, CardData, CardSwipeDirection } from '../constants/types'
import CardBack from './CardBack'
import CardFront from './CardFront'
import { useRipple, } from '../hooks/ripple'

export type { CardData, CardSwipeDirection }

const CARD_RIPPLE_CONFIG = {
  amplitude: 10,
  frequency: 8,
  decay: 3,
  speed: 250,
  duration: 2.2,
} as const

const Card3D = ({ card, isActive, onSwipePage }: Card3DProps) => {
  const { uniforms, intensity, trigger } = useRipple({
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    ...CARD_RIPPLE_CONFIG,
  })

  const { gesture, frontStyle, backStyle, rippleStyle, isFrontVisible, isBackVisible } = useCardFlipGesture({
  enabled: isActive,
  onSwipePage,
  onSettle: trigger,
})

return (
  <GestureDetector gesture={gesture}>
    <Animated.View style={styles.wrapper}>
      <Animated.View style={[styles.face, frontStyle]}>
        <CardFront
          lastFourDigits={card.lastFourDigits}
          holderName={card.holderName}
          expiry={card.expiry}
          balance={card.balance}
          visible={isFrontVisible}
        />
      </Animated.View>

      <Animated.View style={[styles.face, backStyle]}>
        <CardBack
          holderName={card.holderName}
          cvv={card.cvv}
          spentThisWeek={card.spentThisWeek}
          previousWeekSpend={card.previousWeekSpend}
          dueBills={card.dueBills}
          subscriptions={card.subscriptions}
          visible={isBackVisible}
        />
      </Animated.View>

      <Animated.View style={[styles.face, rippleStyle]}>
        <RippleOverlay
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          borderRadius={verticalScale(CARD_BORDER_RADIUS)}
          color="rgba(80, 31, 129, 0.35)"
          uniforms={uniforms}
          intensity={intensity}
        />
      </Animated.View>
    </Animated.View>
  </GestureDetector>
)
}

export default Card3D

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  face: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
})
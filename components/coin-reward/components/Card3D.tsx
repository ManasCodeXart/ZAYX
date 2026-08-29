import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import BackCard from './BackCard'
import FrontCard, { CARD_HEIGHT, CARD_WIDTH } from './FrontCard'

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
}

const PAGE_DISTANCE_THRESHOLD = CARD_WIDTH * 0.28
const PAGE_VELOCITY_THRESHOLD = 800

export type CardData = {
  id: string
  cardNumber: string
  holderName: string
  expiry: string
  balance: number
  cvv: string
  spentThisWeek: number
  spendingDelta: number
  isIncrease: boolean
  dueBills: number
  subscriptions: number
}

type Card3DProps = {
  card: CardData
  isActive: boolean
  onSwipePage: (direction: 'next' | 'prev') => void
}

const Card3D = ({ card, isActive, onSwipePage }: Card3DProps) => {
  const rotateY = useSharedValue(0)
  const rotateX = useSharedValue(0)
  const savedRotateY = useSharedValue(0)
  const savedRotateX = useSharedValue(0)

  const [frontVisible, setFrontVisible] = useState(true)
  const [backVisible, setBackVisible]   = useState(false)

  const updateVisibility = (normalizedY: number, normalizedX: number) => {
    const yShowingBack = normalizedY > 90 && normalizedY < 270
    const xShowingBack = normalizedX > 90 && normalizedX < 270
    const showingBack  = yShowingBack !== xShowingBack // XOR — either axis flipped but not both
    setFrontVisible(!showingBack)
    setBackVisible(showingBack)
  }

  const pan = Gesture.Pan()
    .enabled(isActive)
    .onBegin(() => {
      savedRotateY.value = rotateY.value
      savedRotateX.value = rotateX.value
    })
    .onUpdate((e) => {
      rotateY.value = savedRotateY.value + e.translationX * 0.4
      rotateX.value = savedRotateX.value - e.translationY * 0.4
    })
    .onEnd((e) => {
      const isPageSwipe =
        Math.abs(e.translationX) > Math.abs(e.translationY) &&
        (Math.abs(e.translationX) > PAGE_DISTANCE_THRESHOLD ||
          Math.abs(e.velocityX) > PAGE_VELOCITY_THRESHOLD)

      if (isPageSwipe) {
        // cancel the in-progress flip, spring back to where the drag started
        rotateY.value = withSpring(savedRotateY.value, SPRING_CONFIG)
        rotateX.value = withSpring(savedRotateX.value, SPRING_CONFIG)
        runOnJS(onSwipePage)(e.translationX > 0 ? 'prev' : 'next')
        return
      }

      // snap Y to nearest face
      const normalizedY      = ((rotateY.value % 360) + 360) % 360
      const fullRotationsY   = Math.floor(rotateY.value / 360) * 360
      const snappedY         = normalizedY > 90 && normalizedY < 270 ? 180 : normalizedY > 270 ? 360 : 0
      rotateY.value          = withSpring(fullRotationsY + snappedY, SPRING_CONFIG)

      // snap X to nearest face
      const normalizedX      = ((rotateX.value % 360) + 360) % 360
      const fullRotationsX   = Math.floor(rotateX.value / 360) * 360
      const snappedX         = normalizedX > 90 && normalizedX < 270 ? 180 : normalizedX > 270 ? 360 : 0
      rotateX.value          = withSpring(fullRotationsX + snappedX, SPRING_CONFIG)

      runOnJS(updateVisibility)(normalizedY, normalizedX)
    })

  const frontStyle = useAnimatedStyle(() => {
    const normalizedY = ((rotateY.value % 360) + 360) % 360
    const normalizedX = ((rotateX.value % 360) + 360) % 360
    const yBack = normalizedY > 90 && normalizedY < 270
    const xBack = normalizedX > 90 && normalizedX < 270
    const opacity = (yBack !== xBack) ? 0 : 1  // XOR

    return {
      opacity,
      transform: [
        { perspective: 600 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    }
  })

  const backStyle = useAnimatedStyle(() => {
    const normalizedY = ((rotateY.value % 360) + 360) % 360
    const normalizedX = ((rotateX.value % 360) + 360) % 360
    const yBack = normalizedY > 90 && normalizedY < 270
    const xBack = normalizedX > 90 && normalizedX < 270
    const opacity = (yBack !== xBack) ? 1 : 0  // XOR

    return {
      opacity,
      transform: [
        { perspective: 600 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value + 180}deg` },
      ],
    }
  })

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.wrapper}>
        <Animated.View style={[styles.card, frontStyle]}>
          <FrontCard
            cardNumber={card.cardNumber}
            holderName={card.holderName}
            expiry={card.expiry}
            balance={card.balance}
            visible={frontVisible}
          />
        </Animated.View>

        <Animated.View style={[styles.card, backStyle]}>
          <BackCard
            holderName={card.holderName}
            cvv={card.cvv}
            spentThisWeek={card.spentThisWeek}
            spendingDelta={card.spendingDelta}
            isIncrease={card.isIncrease}
            dueBills={card.dueBills}
            subscriptions={card.subscriptions}
            visible={backVisible}
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
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
})
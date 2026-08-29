import { BlurView } from 'expo-blur'
import { useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'
import Card3D, { CardData } from './Card3D'
import { CARD_HEIGHT, CARD_WIDTH } from './FrontCard'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const GAP = 16
const SLOT_WIDTH = CARD_WIDTH + GAP
const SIDE_SCALE = 0.86
const SIDE_OPACITY = 0.45
const BLUR_MAX = 35

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

type CardCarouselProps = {
  cards: CardData[]
}

const CardCarousel = ({ cards }: CardCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const activePosition = useSharedValue(0) // continuous, springs toward activeIndex
  const blurIntensity  = useSharedValue(0)

  const handleSwipePage = (direction: 'next' | 'prev') => {
    const nextIndex = activeIndex + (direction === 'next' ? 1 : -1)
    if (nextIndex < 0 || nextIndex > cards.length - 1) return // at bounds, no-op

    setActiveIndex(nextIndex)
    blurIntensity.value = withTiming(BLUR_MAX, { duration: 150 })
    activePosition.value = withSpring(nextIndex, SPRING_CONFIG, (finished) => {
      if (finished) {
        blurIntensity.value = withTiming(0, { duration: 250 })
      }
    })
  }

  const trackStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          (SCREEN_WIDTH - CARD_WIDTH) / 2 - activePosition.value * SLOT_WIDTH,
      },
    ],
  }))

  const blurProps = useAnimatedProps(() => ({
    intensity: blurIntensity.value,
  }))

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, trackStyle]}>
        {cards.map((card, index) => (
          <CarouselSlot
            key={card.id}
            card={card}
            index={index}
            activePosition={activePosition}
            isActive={index === activeIndex}
            onSwipePage={handleSwipePage}
          />
        ))}
      </Animated.View>

      <AnimatedBlurView
        animatedProps={blurProps}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}

type CarouselSlotProps = {
  card: CardData
  index: number
  activePosition: SharedValue<number>
  isActive: boolean
  onSwipePage: (direction: 'next' | 'prev') => void
}

const CarouselSlot = ({ card, index, activePosition, isActive, onSwipePage }: CarouselSlotProps) => {
  const slotStyle = useAnimatedStyle(() => {
    const distance = index - activePosition.value
    const scale   = interpolate(distance, [-1, 0, 1], [SIDE_SCALE, 1, SIDE_SCALE], Extrapolation.CLAMP)
    const opacity = interpolate(distance, [-1, 0, 1], [SIDE_OPACITY, 1, SIDE_OPACITY], Extrapolation.CLAMP)
    return {
      transform: [{ scale }],
      opacity,
    }
  })

  return (
    <Animated.View style={[styles.slot, slotStyle]}>
      <Card3D card={card} isActive={isActive} onSwipePage={onSwipePage} />
    </Animated.View>
  )
}

export default CardCarousel

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    position: 'absolute',
    gap: GAP,
  },
  slot: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
})
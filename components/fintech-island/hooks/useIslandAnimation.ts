import {
  useCallback,
} from 'react'
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  ISLAND,
  LOTTIE,
  SPRING_COLLAPSE,
  SPRING_EXPAND,
  SPRING_SMOOTH,
  SPRING_SNAPPY,
} from '../constants/island'
import { verticalScale } from '../constants/scaling'
import type { IslandState } from '../constants/types'



export const useIslandAnimation = (onDismissComplete?: () => void) => {

  const islandState = useSharedValue<IslandState>('hidden')

  const morphWidth = useSharedValue<number>(ISLAND.PILL.height)
  const morphHeight = useSharedValue<number>(ISLAND.PILL.height)
  const morphRadius = useSharedValue<number>(ISLAND.PILL.radius)

  const containerOpacity = useSharedValue(0)
  const containerScale = useSharedValue(1)

  const pillContentOpacity = useSharedValue(0)
  const card1ContentOpacity = useSharedValue(0)

  const card2Opacity = useSharedValue(0)
  const card2TranslateY = useSharedValue(verticalScale(-12))

  const lottieProgress = useSharedValue(0)



  const morphStyle = useAnimatedStyle(() => ({
    width: morphWidth.value,
    height: morphHeight.value,
    borderRadius: morphRadius.value,
  }))

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }))

  const pillContentStyle = useAnimatedStyle(() => ({
    opacity: pillContentOpacity.value,
  }))

  const card1ContentStyle = useAnimatedStyle(() => ({
    opacity: card1ContentOpacity.value,
  }))

  const card2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
    transform: [{ translateY: card2TranslateY.value }],
  }))

  const lottieAnimatedProps = useAnimatedProps(() => ({
    progress: lottieProgress.value,
  }))


  const reset = useCallback(() => {
    cancelAnimation(pillContentOpacity)
    cancelAnimation(card1ContentOpacity)
    cancelAnimation(card2Opacity)
    cancelAnimation(card2TranslateY)
    cancelAnimation(containerOpacity)
    cancelAnimation(containerScale)
    cancelAnimation(morphWidth)
    cancelAnimation(morphHeight)
    cancelAnimation(morphRadius)
    cancelAnimation(lottieProgress)

    pillContentOpacity.value = 0
    card1ContentOpacity.value = 0
    card2Opacity.value = 0
    card2TranslateY.value = verticalScale(-12)
    containerOpacity.value = 0
    containerScale.value = 1
    morphWidth.value = ISLAND.PILL.height
    morphHeight.value = ISLAND.PILL.height
    morphRadius.value = ISLAND.PILL.radius
    lottieProgress.value = 0
  }, [])


  const showCompact = useCallback((isInitial = false, lottieMode: 'loop' | 'playOnce' = 'loop', lottieDuration: number = LOTTIE.CARD_ADDED.PLAY_DURATION) => {
    islandState.value = 'compact'

    if (isInitial) {
      if (lottieMode === 'loop') {
        lottieProgress.value = 0
        lottieProgress.value = withRepeat(
          withSequence(
            withTiming(LOTTIE.SENDING_LOOP_END, {
              duration: LOTTIE.LOOP_DURATION,
              easing: Easing.linear,
            }),
            withTiming(0, { duration: 0 })
          ),
          -1,
          false
        )
      } else {

        lottieProgress.value = 0
        lottieProgress.value = withTiming(1, {
          duration: lottieDuration,
          easing: Easing.inOut(Easing.cubic),
        })
      }

      containerOpacity.value = 1
      containerScale.value = 1


      morphWidth.value = withSpring(ISLAND.PILL.width, SPRING_EXPAND)
      morphHeight.value = withSpring(ISLAND.PILL.height, SPRING_SMOOTH)
      morphRadius.value = withSpring(ISLAND.PILL.radius, SPRING_SMOOTH)

      pillContentOpacity.value = withDelay(140, withTiming(1, { duration: 200 }))
    } else {

      containerOpacity.value = withSpring(1, SPRING_SNAPPY)
      containerScale.value = withSpring(1, SPRING_SNAPPY)

      morphWidth.value = withSpring(ISLAND.PILL.width, SPRING_SMOOTH)
      morphHeight.value = withSpring(ISLAND.PILL.height, SPRING_SMOOTH)
      morphRadius.value = withSpring(ISLAND.PILL.radius, SPRING_SMOOTH)

      card1ContentOpacity.value = withTiming(0, { duration: 80 })

      cancelAnimation(pillContentOpacity)
      pillContentOpacity.value = 0
      pillContentOpacity.value = withDelay(220, withTiming(1, { duration: 200 }))
    }

    card2Opacity.value = withTiming(0, { duration: 120 })
    card2TranslateY.value = withTiming(verticalScale(-12), { duration: 120 })
  }, [])

  /**
   * compact → expanded
   * Pill morphs into Card 1. Card 2 slides in.
   */
  const showExpanded = () => {
    islandState.value = 'expanded'

    pillContentOpacity.value = withTiming(0, { duration: 100 })

    morphWidth.value = withDelay(60, withSpring(ISLAND.CARD1.width, SPRING_SNAPPY))
    morphHeight.value = withDelay(100, withSpring(ISLAND.CARD1.height, SPRING_SNAPPY))
    morphRadius.value = withDelay(60, withSpring(ISLAND.CARD1.radius, SPRING_SNAPPY))

    card1ContentOpacity.value = withDelay(240, withTiming(1, { duration: 200 }))

    card2TranslateY.value = withDelay(340, withSpring(0, SPRING_SNAPPY))
    card2Opacity.value = withDelay(340, withTiming(1, { duration: 250 }))
  }

  /**
   * expanded → success
   * Card 2 exits, Card 1 collapses to pill, "Sent".
   */
  const showSuccess = (keepExpanded?: boolean) => {
    islandState.value = 'success'

    lottieProgress.value = withTiming(LOTTIE.RESOLVE_END, {
      duration: LOTTIE.RESOLVE_DURATION,
      easing: Easing.out(Easing.cubic),
    })

    if (keepExpanded) {
      return
    }

    card2Opacity.value = withTiming(0, { duration: 140 })
    card2TranslateY.value = withTiming(verticalScale(-12), { duration: 140 })

    card1ContentOpacity.value = withTiming(0, { duration: 120 })

    morphWidth.value = withDelay(180, withSpring(ISLAND.PILL.width, SPRING_SMOOTH))
    morphHeight.value = withDelay(180, withSpring(ISLAND.PILL.height, SPRING_SMOOTH))
    morphRadius.value = withDelay(180, withSpring(ISLAND.PILL.radius, SPRING_SMOOTH))

    pillContentOpacity.value = withDelay(400, withTiming(1, { duration: 200 }))
  }


  const dismiss = () => {
    islandState.value = 'dismissing'


    cancelAnimation(pillContentOpacity)
    cancelAnimation(card1ContentOpacity)
    cancelAnimation(card2Opacity)
    cancelAnimation(lottieProgress)
    lottieProgress.value = 0

    pillContentOpacity.value = withTiming(0, { duration: 100 })
    card1ContentOpacity.value = withTiming(0, { duration: 100 })
    card2Opacity.value = withTiming(0, { duration: 100 })
    card2TranslateY.value = withTiming(verticalScale(-12), { duration: 120 })


    morphWidth.value = withSpring(ISLAND.PILL.height, SPRING_COLLAPSE)
    morphHeight.value = withSpring(ISLAND.PILL.height, SPRING_COLLAPSE)
    morphRadius.value = withSpring(ISLAND.PILL.radius, SPRING_COLLAPSE)


    containerOpacity.value = withDelay(180, withTiming(0, { duration: 200 }, (finished) => {
      'worklet'
      if (finished) {
        islandState.value = 'hidden'
        if (onDismissComplete) runOnJS(onDismissComplete)()
      }
    }))
  }

  return {
    islandState,
    morphStyle,
    containerStyle,
    pillContentStyle,
    card1ContentStyle,
    card2Style,
    lottieAnimatedProps,
    reset,
    showCompact,
    showExpanded,
    showSuccess,
    dismiss,
  }
}
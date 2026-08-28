import {
  CARD_FLIP_COMMIT_THRESHOLD_DEG,
  CARD_FLIP_PERSPECTIVE,
  CARD_FLIP_SPRING,
  CARD_PAGE_DISTANCE_THRESHOLD,
  CARD_PAGE_VELOCITY_THRESHOLD,
} from '../constants/card3d'
import { useState } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import type { CardFace, UseCardFlipGestureParams } from '../constants/types'
import {
  getRotationProgress,
  isAngleShowingBack,
  normalizeAngle,
  resolveSnappedRotation,
} from './flipRotation'

const DRAG_TO_ROTATION_RATIO = 0.4
const SETTLED_AXES_REQUIRED = 2

export function useCardFlipGesture({ enabled, onSwipePage, onSettle }: UseCardFlipGestureParams) {
  const rotateY = useSharedValue(0)
  const rotateX = useSharedValue(0)
  const savedRotateY = useSharedValue(0)
  const savedRotateX = useSharedValue(0)

  const hasTriggeredRipple = useSharedValue(false)
  const settledAxisCount = useSharedValue(0)

  const [activeFace, setActiveFace] = useState<CardFace>('front')

  const applyVisibility = (normalizedY: number, normalizedX: number) => {
    const showingBack = isAngleShowingBack(normalizedY) !== isAngleShowingBack(normalizedX)
    setActiveFace(showingBack ? 'back' : 'front')
  }

  const handleAxisSettle = (finished?: boolean) => {
    'worklet'
    if (!finished || hasTriggeredRipple.value) return
    settledAxisCount.value += 1
    if (settledAxisCount.value < SETTLED_AXES_REQUIRED) return
    hasTriggeredRipple.value = true
    onSettle()
  }

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onBegin(() => {
      savedRotateY.value = rotateY.value
      savedRotateX.value = rotateX.value
      hasTriggeredRipple.value = false
      settledAxisCount.value = 0
    })
    .onUpdate((e) => {
      rotateY.value = savedRotateY.value + e.translationX * DRAG_TO_ROTATION_RATIO
      rotateX.value = savedRotateX.value - e.translationY * DRAG_TO_ROTATION_RATIO
    })
    .onEnd((e) => {
      const normalizedY = normalizeAngle(rotateY.value)
      const hasCommittedToFlip = getRotationProgress(normalizedY) > CARD_FLIP_COMMIT_THRESHOLD_DEG

      const isPageSwipe =
        !hasCommittedToFlip &&
        Math.abs(e.translationX) > Math.abs(e.translationY) &&
        (Math.abs(e.translationX) > CARD_PAGE_DISTANCE_THRESHOLD ||
          Math.abs(e.velocityX) > CARD_PAGE_VELOCITY_THRESHOLD)

      if (isPageSwipe) {
        rotateY.value = withSpring(savedRotateY.value, CARD_FLIP_SPRING)
        rotateX.value = withSpring(savedRotateX.value, CARD_FLIP_SPRING)
        runOnJS(onSwipePage)(e.translationX > 0 ? 'prev' : 'next')
        return
      }

      const normalizedX = normalizeAngle(rotateX.value)
      rotateY.value = withSpring(resolveSnappedRotation(rotateY.value), CARD_FLIP_SPRING, handleAxisSettle)
      rotateX.value = withSpring(resolveSnappedRotation(rotateX.value), CARD_FLIP_SPRING, handleAxisSettle)

      runOnJS(applyVisibility)(normalizedY, normalizedX)
    })

  const isShowingBack = useDerivedValue(
    () => isAngleShowingBack(normalizeAngle(rotateY.value)) !== isAngleShowingBack(normalizeAngle(rotateX.value)),
  )

  const frontStyle = useAnimatedStyle(() => ({
    opacity: isShowingBack.value ? 0 : 1,
    transform: [
      { perspective: CARD_FLIP_PERSPECTIVE },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
    ],
  }))

  const backStyle = useAnimatedStyle(() => ({
    opacity: isShowingBack.value ? 1 : 0,
    transform: [
      { perspective: CARD_FLIP_PERSPECTIVE },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value + 180}deg` },
    ],
  }))


  const rippleStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: CARD_FLIP_PERSPECTIVE },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${isShowingBack.value ? rotateY.value + 180 : rotateY.value}deg` },
    ],
  }))
  return {
    gesture,
    frontStyle,
    backStyle,
    rippleStyle,
    isFrontVisible: activeFace === 'front',
    isBackVisible: activeFace === 'back',
  }
}
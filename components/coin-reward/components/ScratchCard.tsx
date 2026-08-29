import {
    Canvas,
    Circle,
    Image,
    Path,
    Skia,
    useImage,
} from '@shopify/react-native-skia'
import LottieView from 'lottie-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated'

import { verticalScale } from '@/constants/scaling'
import { ScratchCardProps, ScratchStroke } from '@/constants/types'
import RevealContent from './RevealContent'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const CARD_MARGIN          = verticalScale(48)
export const CARD_WIDTH    = SCREEN_WIDTH - CARD_MARGIN
export const CARD_HEIGHT   = SCREEN_HEIGHT * 0.52 // tall enough to cover the coin
export const SLIDE_EXIT_DURATION = 280
const CARD_BOTTOM_OFFSET   = verticalScale(215)
const CARD_BORDER_RADIUS   = verticalScale(24)
const BRUSH_RADIUS         = verticalScale(28)
const SHADOW_OFFSET_HEIGHT = verticalScale(12)
const SHADOW_RADIUS        = verticalScale(20)

const REVEAL_THRESHOLD = 0.18
const GRID_COLS = 20
const GRID_ROWS = 20
const GRID_CELL_COUNT = GRID_COLS * GRID_ROWS

const STAGGER_DELAY = 40
const BACKDROP_ENTER_DURATION = 260
const BACKDROP_EXIT_DURATION = 220
const CARD_FADE_IN_DURATION = 220
const CARD_FADE_OUT_DURATION = 180
const CARD_SCALE_DURATION = 220
const CARD_ENTER_SCALE_FROM = 0.94
const CARD_EXIT_SCALE_TO = 0.96

const REVEAL_FADE_DURATION = 400
const CARD_ENTER_SPRING = { damping: 20, stiffness: 130, mass: 0.85 }


interface Stroke extends ScratchStroke {
    pointCount: number
}

const ScratchCard = ({ face, visible, onDismiss, onFullyRevealed }: ScratchCardProps) => {
    
    const strokesRef = useRef<Stroke[]>([])
    const [scratchVersion, setScratchVersion] = useState(0)
    const bumpScratchVersion = useCallback(() => setScratchVersion((v) => v + 1), [])
    const resetScratchVersion = useCallback(() => setScratchVersion(0), [])

    const [revealed, setRevealed] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const touchedCells = useRef(new Set<string>())

    const translateY      = useSharedValue(SCREEN_HEIGHT)
    const backdropOpacity = useSharedValue(0)
    const overlayOpacity  = useSharedValue(1)
    const cardOpacity     = useSharedValue(0)
    const cardScale       = useSharedValue(CARD_ENTER_SCALE_FROM)

    useEffect(() => {
        if (visible) {
            strokesRef.current = []
            touchedCells.current = new Set<string>()
            setRevealed(false)
            setShowConfetti(false)
            overlayOpacity.value = 1
            resetScratchVersion()

            cardOpacity.value = 0
            cardScale.value = CARD_ENTER_SCALE_FROM

            backdropOpacity.value = withTiming(1, { duration: BACKDROP_ENTER_DURATION, easing: Easing.out(Easing.cubic) })
            cardOpacity.value = withDelay(STAGGER_DELAY, withTiming(1, { duration: CARD_FADE_IN_DURATION, easing: Easing.out(Easing.cubic) }))
            translateY.value  = withDelay(STAGGER_DELAY, withSpring(0, CARD_ENTER_SPRING))
            cardScale.value   = withDelay(STAGGER_DELAY, withSpring(1, CARD_ENTER_SPRING))
        } else {
            backdropOpacity.value = withTiming(0, { duration: BACKDROP_EXIT_DURATION, easing: Easing.in(Easing.cubic) })
            cardOpacity.value = withTiming(0, { duration: CARD_FADE_OUT_DURATION })
            cardScale.value   = withTiming(CARD_EXIT_SCALE_TO, { duration: CARD_SCALE_DURATION, easing: Easing.in(Easing.cubic) })
            translateY.value  = withTiming(SCREEN_HEIGHT, { duration: SLIDE_EXIT_DURATION, easing: Easing.in(Easing.cubic) })
        }
    }, [visible])

    const scratchTexture = useImage(require('../assets/images/giftwrap.gif'))

    const checkRevealThreshold = useCallback((x: number, y: number) => {
        const col = Math.floor((x / CARD_WIDTH) * GRID_COLS)
        const row = Math.floor((y / CARD_HEIGHT) * GRID_ROWS)
        touchedCells.current.add(`${col}-${row}`)

        const coverage = touchedCells.current.size / GRID_CELL_COUNT
        if (coverage >= REVEAL_THRESHOLD && !revealed) {
            setRevealed(true)
            setShowConfetti(true)
            overlayOpacity.value = withTiming(0, { duration: REVEAL_FADE_DURATION }, () => {
                if (onFullyRevealed) runOnJS(onFullyRevealed)()
            })
        }
    }, [revealed, onFullyRevealed])

    const beginStroke = useCallback((x: number, y: number) => {
        const builder = Skia.PathBuilder.Make()
        builder.moveTo(x, y)
        strokesRef.current.push({ builder, lastPoint: { x, y }, pointCount: 1 })
        bumpScratchVersion()
        checkRevealThreshold(x, y)
    }, [bumpScratchVersion, checkRevealThreshold])

    const addPoint = useCallback((x: number, y: number) => {
        const strokes = strokesRef.current
        if (strokes.length === 0) return

        const stroke = strokes[strokes.length - 1]
        const { lastPoint } = stroke
        if (lastPoint) {
            stroke.builder.quadTo(lastPoint.x, lastPoint.y, (lastPoint.x + x) / 2, (lastPoint.y + y) / 2)
        }
        stroke.lastPoint = { x, y }
        stroke.pointCount += 1

        bumpScratchVersion()
        checkRevealThreshold(x, y)
    }, [bumpScratchVersion, checkRevealThreshold])

    const gesture = useMemo(
        () =>
            Gesture.Pan()
                .onBegin((e) => {
                    if (revealed) return
                    runOnJS(beginStroke)(e.x, e.y)
                })
                .onUpdate((e) => {
                    if (revealed) return
                    runOnJS(addPoint)(e.x, e.y)
                }),
        [revealed, beginStroke, addPoint],
    )

    const cardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: cardScale.value },
        ],
    }))

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }))

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }))

    const strokes = strokesRef.current

    return (
        <>
            <TouchableWithoutFeedback onPress={onDismiss}>
                <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents={visible ? 'auto' : 'none'} />
            </TouchableWithoutFeedback>

            <Animated.View style={[styles.wrapper, cardStyle]}>
                <View style={styles.card}>
                    <View style={StyleSheet.absoluteFill}>
                        {face && <RevealContent face={face} />}
                    </View>

                    <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
                        <GestureDetector gesture={gesture}>
                            <Canvas style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                                {scratchTexture && (
                                    <Image
                                        image={scratchTexture}
                                        x={0} y={0}
                                        width={CARD_WIDTH}
                                        height={CARD_HEIGHT}
                                        fit="cover"
                                    />
                                )}

                                {strokes.map((stroke, i) =>
                                    stroke.pointCount === 1 && stroke.lastPoint ? (
                                        <Circle
                                            key={i}
                                            cx={stroke.lastPoint.x}
                                            cy={stroke.lastPoint.y}
                                            r={BRUSH_RADIUS}
                                            color="white"
                                            blendMode="clear"
                                        />
                                    ) : (
                                        <Path
                                            key={i}
                                            path={stroke.builder.build()}
                                            color="white"
                                            style="stroke"
                                            strokeWidth={BRUSH_RADIUS * 2}
                                            strokeCap="round"
                                            strokeJoin="round"
                                            blendMode="clear"
                                        />
                                    ),
                                )}
                            </Canvas>
                        </GestureDetector>
                    </Animated.View>

                    {showConfetti && (
                        <LottieView
                            source={require('../assets/lottie/confetti.json')}
                            autoPlay
                            loop={false}
                            onAnimationFinish={() => setShowConfetti(false)}
                            style={styles.confetti}
                            resizeMode="cover"
                        />
                    )}
                </View>
            </Animated.View>
        </>
    )
}

export default ScratchCard

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    wrapper: {
        position: 'absolute',
        bottom: CARD_BOTTOM_OFFSET,
        alignSelf: 'center',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_BORDER_RADIUS,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: SHADOW_OFFSET_HEIGHT },
        shadowOpacity: 0.4,
        shadowRadius: SHADOW_RADIUS,
        elevation: 16,
    },
    card: {
        flex: 1,
        borderRadius: CARD_BORDER_RADIUS,
        overflow: 'hidden',
    },
    confetti: {
        ...StyleSheet.absoluteFill,
        zIndex: 10,
        pointerEvents: 'none',
    },
})
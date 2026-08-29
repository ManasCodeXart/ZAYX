import { useEffect } from 'react'
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { verticalScale } from '../constants/scaling'
import AnimatedCounter from './AnimatedCounter'

const { width } = Dimensions.get('window')

export const CARD_WIDTH = width * 0.85
export const CARD_HEIGHT = CARD_WIDTH * 1.586

const FADE_DURATION = 400
const COUNTER_DURATION = 1000

type FrontCardProps = {
  cardNumber: string
  holderName: string
  expiry: string
  balance: number
  visible: boolean
}

const FrontCard = ({
  cardNumber,
  holderName,
  expiry,
  balance,
  visible,
}: FrontCardProps) => {

  // individual opacities for staggered feel
  const opacityTop    = useSharedValue(0)
  const opacityMiddle = useSharedValue(0)
  const opacityStrip  = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacityTop.value    = withDelay(0,   withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
      opacityMiddle.value = withDelay(100, withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
      opacityStrip.value  = withDelay(200, withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
    } else {
      // reset instantly so next reveal animates fresh
      opacityTop.value    = 0
      opacityMiddle.value = 0
      opacityStrip.value  = 0
    }
  }, [visible])

  const topStyle    = useAnimatedStyle(() => ({ opacity: opacityTop.value }))
  const middleStyle = useAnimatedStyle(() => ({ opacity: opacityMiddle.value }))
  const stripStyle  = useAnimatedStyle(() => ({ opacity: opacityStrip.value }))

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/GRD.png')}
        style={styles.card}
        imageStyle={styles.cardImage}
        resizeMode="cover"
      >
        {/* ── Top Row ── */}
        <Animated.View style={[styles.topRow, topStyle]}>
          <Image
            source={require('../assets/images/chip2.png')}
            style={styles.visaLogo}
            resizeMode="contain"
          />
          <Image
            source={require('../assets/images/chip2.png')}
            style={styles.chip}
            resizeMode="contain"
          />
        </Animated.View>

        {/* ── Middle Content ── */}
        <Animated.View style={[styles.middle, middleStyle]}>
          <Text style={styles.label}>Card Number</Text>
          <Text style={styles.cardNumber}>
            **** **** **** {cardNumber}
          </Text>

          <Text style={[styles.label, { marginTop: verticalScale(28) }]}>Balance</Text>
          <AnimatedCounter
          key={`spent-${visible}`}
            value={balance}
            prefix="$"
            decimals={2}
            duration={COUNTER_DURATION}
            delay={100}
            style={styles.balance}
          />
        </Animated.View>

        {/* ── Bottom Strip ── */}
        <Animated.View style={[styles.strip, stripStyle]}>
          <View>
            <Text style={styles.stripLabel}>Card holder name</Text>
            <Text style={styles.stripValue}>{holderName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.stripLabel}>Expiry date</Text>
            <Text style={styles.stripValue}>{expiry}</Text>
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  )
}

export default FrontCard

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: verticalScale(24),
  },
  card: {
    flex: 1,
    borderRadius: verticalScale(24),
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardImage: {
    borderRadius: verticalScale(24),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: verticalScale(28),
    paddingTop: verticalScale(28),
  },
  visaLogo: {
    width: verticalScale(72),
    height: verticalScale(28),
  },
  chip: {
    width: verticalScale(52),
    height: verticalScale(40),
  },
  middle: {
    paddingHorizontal: verticalScale(28),
    paddingBottom: verticalScale(16),
  },
  label: {
    color: '#ffffff',
    fontSize: verticalScale(16),
    fontFamily: 'SpaceGroteskMedium',
    marginBottom: verticalScale(4),
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: verticalScale(21),
    fontFamily: 'SpaceGroteskMedium',
    letterSpacing: 1,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: verticalScale(44),
    fontFamily: 'SpaceGroteskBold',
    letterSpacing: 1.5,
    marginTop: verticalScale(4),
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    paddingHorizontal: verticalScale(28),
    paddingVertical: verticalScale(18),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  stripLabel: {
    color: '#ffffff',
    fontSize: verticalScale(12),
    fontFamily: 'SpaceGroteskMedium',
    marginBottom: verticalScale(4),
  },
  stripValue: {
    color: '#FFFFFF',
    fontSize: verticalScale(16),
    fontFamily: 'SpaceGroteskBold',
    letterSpacing: 1,
  },
})
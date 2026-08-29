import { useEffect } from 'react'
import {
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
import { CARD_HEIGHT, CARD_WIDTH } from './FrontCard'

const FADE_DURATION = 400
const COUNTER_DURATION = 1000

type BackCardProps = {
  holderName: string
  cvv: string
  spentThisWeek: number
  spendingDelta: number
  isIncrease: boolean
  dueBills: number
  subscriptions: number
  visible: boolean
}

const BackCard = ({
  holderName,
  cvv,
  spentThisWeek,
  spendingDelta,
  isIncrease,
  dueBills,
  subscriptions,
  visible,
}: BackCardProps) => {

  const opacityTop    = useSharedValue(0)
  const opacityCenter = useSharedValue(0)
  const opacityStats  = useSharedValue(0)
  const opacityStrip  = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      opacityTop.value    = withDelay(0,   withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
      opacityCenter.value = withDelay(100, withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
      opacityStats.value  = withDelay(200, withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
      opacityStrip.value  = withDelay(300, withTiming(1, { duration: FADE_DURATION, easing: Easing.out(Easing.ease) }))
    } else {
      opacityTop.value    = 0
      opacityCenter.value = 0
      opacityStats.value  = 0
      opacityStrip.value  = 0
    }
  }, [visible])

  const topStyle    = useAnimatedStyle(() => ({ opacity: opacityTop.value }))
  const centerStyle = useAnimatedStyle(() => ({ opacity: opacityCenter.value }))
  const statsStyle  = useAnimatedStyle(() => ({ opacity: opacityStats.value }))
  const stripStyle  = useAnimatedStyle(() => ({ opacity: opacityStrip.value }))

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/GRD.png')}
        style={styles.card}
        imageStyle={styles.cardImage}
        resizeMode="cover"
      >

        {/* ── Top: Spent this week ── */}
<Animated.View style={[styles.top, topStyle]}>
  <Text style={styles.spentLabel}>Spent this week</Text>
  <AnimatedCounter
    key={`spent-${visible}`}  // 👈
    value={spentThisWeek}
    prefix="$"
    decimals={0}
    duration={COUNTER_DURATION}
    delay={0}
    style={styles.spentAmount}
  />
</Animated.View>

{/* ── Center: Big % delta ── */}
<Animated.View style={[styles.center, centerStyle]}>
  <View style={styles.deltaRow}>
    <AnimatedCounter
      key={`delta-${visible}`}  // 👈
      value={spendingDelta}
      decimals={0}
      duration={COUNTER_DURATION}
      delay={100}
      style={styles.deltaNumber}
    />
            <View style={styles.deltaSuffix}>
              <Text style={styles.deltaPercent}>%</Text>
              <Image
                source={require('../assets/images/delta-arrow.png')}
                style={styles.deltaArrow}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.deltaCaption}>
            {isIncrease
              ? 'Spending increased this week'
              : 'Spending decreased this week'}
          </Text>
        </Animated.View>

        {/* ── Stats row ── */}
        <Animated.View style={[styles.statsRow, statsStyle]}>
          <View>
            <Text style={styles.statLabel}>Due Bills</Text>
           <AnimatedCounter
  key={`bills-${visible}`}  // 👈
  value={dueBills}
  prefix="$"
  decimals={0}
  duration={COUNTER_DURATION}
  delay={200}
  style={styles.statValue}
/>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>Subscriptions</Text>
           <AnimatedCounter
  key={`subs-${visible}`}  // 👈
  value={subscriptions}
  prefix="$"
  decimals={0}
  duration={COUNTER_DURATION}
  delay={200}
  style={styles.statValue}
/>
          </View>
        </Animated.View>

        {/* ── Bottom Strip ── */}
        <Animated.View style={[styles.strip, stripStyle]}>
          <View>
            <Text style={styles.stripLabel}>Card holder name</Text>
            <Text style={styles.stripValue}>{holderName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.stripLabel}>CVV Number</Text>
            <Text style={styles.stripValue}>{cvv}</Text>
          </View>
        </Animated.View>

      </ImageBackground>
    </View>
  )
}

export default BackCard

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
  top: {
    paddingHorizontal: verticalScale(28),
    paddingTop: verticalScale(28),
  },
  spentLabel: {
    color: '#FFFFFF',
    fontSize: verticalScale(14),
    fontFamily: 'SpaceGroteskMedium',
    marginBottom: verticalScale(4),
  },
  spentAmount: {
    color: '#FFFFFF',
    fontSize: verticalScale(36),
    fontFamily: 'SpaceGroteskBold',
    letterSpacing: 3,
  },
  center: {
    paddingHorizontal: verticalScale(28),
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  deltaNumber: {
    color: '#FFFFFF',
    fontSize: verticalScale(100),
    fontFamily: 'SpaceGroteskMedium',
    lineHeight: verticalScale(90),
    letterSpacing: 8,
  },
  deltaSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(0),
    marginLeft: verticalScale(8),
    gap: verticalScale(4),
  },
  deltaPercent: {
    color: '#FFFFFF',
    fontSize: verticalScale(34),
    fontFamily: 'PoppinsMedium',
    marginTop: verticalScale(10),
  },
  deltaArrow: {
    width: verticalScale(22),
    height: verticalScale(22),
  },
  deltaCaption: {
    color: '#FFFFFF',
    fontSize: verticalScale(14),
    fontFamily: 'SpaceGroteskMedium',
    marginTop: verticalScale(4),
    
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: verticalScale(28),
    paddingBottom: verticalScale(8),
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: verticalScale(13),
    fontFamily: 'SpaceGroteskMedium',
    opacity: 0.75,
    marginBottom: verticalScale(4),
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: verticalScale(22),
    fontFamily: 'SpaceGroteskBold',
    letterSpacing: 0.5,
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
    color: '#FFFFFF',
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
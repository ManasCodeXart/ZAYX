import { Image, ImageBackground, StyleSheet, Text } from 'react-native'
import Animated from 'react-native-reanimated'
import AnimatedCounter from '../components/AnimatedCounter'
import CardInfoField from '../components/CardInfoField'
import {
  CARD_BORDER_RADIUS,
  CARD_COLORS,
  CARD_COUNTER_DURATION,
  CARD_FONTS,
  CARD_HEIGHT,
  CARD_WIDTH,
} from '../constants/card3d'
import { verticalScale } from '../constants/scaling'
import type { CardFrontProps } from '../constants/types'
import { useFadeIn } from '../hooks/useFadeIn'

const MASKED_DIGITS = '**** **** ****'

const CardFront = ({ lastFourDigits, holderName, expiry, balance, visible }: CardFrontProps) => {
  const topStyle = useFadeIn(visible, 0)
  const middleStyle = useFadeIn(visible, 100)
  const stripStyle = useFadeIn(visible, 200)

  return (
    <ImageBackground
      source={require('../assets/images/CardBG1.png')}
      style={styles.card}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      <Animated.View style={[styles.topRow, topStyle]}>
        <Image source={require('../assets/images/visa.png')} style={styles.visaLogo} resizeMode="contain" />
        <Image source={require('../assets/images/chip2.png')} style={styles.chip} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[styles.middle, middleStyle]}>
        <Text style={styles.label}>Card Number</Text>
        <Text style={styles.cardNumber}>
          {MASKED_DIGITS} {lastFourDigits.slice(-4)}
        </Text>

        <Text style={styles.balanceLabel}>Balance</Text>
        <AnimatedCounter
          key={`balance-${visible}`}
          value={balance}
          prefix="$"
          decimals={2}
          duration={CARD_COUNTER_DURATION}
          delay={100}
          style={styles.balance}
        />
      </Animated.View>

      <Animated.View style={[styles.strip, stripStyle]}>
        <CardInfoField label="Card holder name" value={holderName} />
        <CardInfoField label="Expiry date" value={expiry} align="right" />
      </Animated.View>
    </ImageBackground>
  )
}

export default CardFront

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: verticalScale(CARD_BORDER_RADIUS),
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardImage: {
    borderRadius: verticalScale(CARD_BORDER_RADIUS),
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
    color: CARD_COLORS.text,
    fontSize: verticalScale(16),
    fontFamily: CARD_FONTS.medium,
    marginBottom: verticalScale(4),
  },
  balanceLabel: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(16),
    fontFamily: CARD_FONTS.medium,
    marginBottom: verticalScale(4),
    marginTop: verticalScale(28),
  },
  cardNumber: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(21),
    fontFamily: CARD_FONTS.medium,
    letterSpacing: 1,
  },
  balance: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(44),
    fontFamily: CARD_FONTS.bold,
    letterSpacing: 1.5,
    marginTop: verticalScale(4),
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD_COLORS.stripBackground,
    paddingHorizontal: verticalScale(28),
    paddingVertical: verticalScale(18),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CARD_COLORS.stripBorder,
  },
})
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
import type { CardBackProps, CardFieldAlign } from '../constants/types'
import { useFadeIn } from '../hooks/useFadeIn'
import { getSpendingTrend } from '../utils/spendingTrend'
import { useMemo } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'

interface StatEntry {
  readonly key: string
  readonly label: string
  readonly value: number
  readonly align: CardFieldAlign
}

const CardBack = ({
  holderName,
  cvv,
  spentThisWeek,
  previousWeekSpend,
  dueBills,
  subscriptions,
  visible,
}: CardBackProps) => {
  const topStyle = useFadeIn(visible, 0)
  const centerStyle = useFadeIn(visible, 100)
  const statsStyle = useFadeIn(visible, 200)
  const stripStyle = useFadeIn(visible, 300)

  const trend = useMemo(
    () => getSpendingTrend(spentThisWeek, previousWeekSpend),
    [spentThisWeek, previousWeekSpend],
  )

  const deltaCaption = !trend.hasComparison
    ? 'No spending history yet'
    : trend.isIncrease
      ? 'Spending increased this week'
      : 'Spending decreased this week'

  const stats: readonly StatEntry[] = [
    { key: 'dueBills', label: 'Due Bills', value: dueBills, align: 'left' },
    { key: 'subscriptions', label: 'Subscriptions', value: subscriptions, align: 'right' },
  ]

  return (
    <ImageBackground
      source={require('../assets/images/CardBG1.png')}
      style={styles.card}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      <Animated.View style={[styles.top, topStyle]}>
        <Text style={styles.spentLabel}>Spent this week</Text>
        <AnimatedCounter
          key={`spent-${visible}`}
          value={spentThisWeek}
          prefix="$"
          decimals={0}
          duration={CARD_COUNTER_DURATION}
          delay={0}
          style={styles.spentAmount}
        />
      </Animated.View>

      <Animated.View style={[styles.center, centerStyle]}>
        <View style={styles.deltaRow}>
          {trend.hasComparison ? (
            <>
              <AnimatedCounter
                key={`delta-${visible}`}
                value={trend.percentChange}
                decimals={0}
                duration={CARD_COUNTER_DURATION}
                delay={100}
                style={styles.deltaNumber}
              />
              <View style={styles.deltaSuffix}>
                <Text style={styles.deltaPercent}>%</Text>
                <Image
                  source={require('../assets/images/delta-arrow.png')}
                  style={[styles.deltaArrow, !trend.isIncrease && styles.deltaArrowFlipped]}
                  resizeMode="contain"
                />
              </View>
            </>
          ) : (
            <Text style={styles.deltaNumber}>—</Text>
          )}
        </View>
        <Text style={styles.deltaCaption}>{deltaCaption}</Text>
      </Animated.View>

      <Animated.View style={[styles.statsRow, statsStyle]}>
        {stats.map((stat) => (
          <CardInfoField
            key={stat.key}
            label={stat.label}
            align={stat.align}
            labelStyle={styles.statLabel}
            valueNode={
              <AnimatedCounter
                key={`${stat.key}-${visible}`}
                value={stat.value}
                prefix="$"
                decimals={0}
                duration={CARD_COUNTER_DURATION}
                delay={200}
                style={styles.statValue}
              />
            }
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.strip, stripStyle]}>
        <CardInfoField label="Card holder name" value={holderName} />
        <CardInfoField label="CVV Number" value={cvv} align="right" />
      </Animated.View>
    </ImageBackground>
  )
}

export default CardBack

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
  top: {
    paddingHorizontal: verticalScale(28),
    paddingTop: verticalScale(28),
  },
  spentLabel: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(14),
    fontFamily: CARD_FONTS.medium,
    marginBottom: verticalScale(4),
  },
  spentAmount: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(36),
    fontFamily: CARD_FONTS.bold,
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
    color: CARD_COLORS.text,
    fontSize: verticalScale(100),
    fontFamily: CARD_FONTS.medium,
    lineHeight: verticalScale(90),
    letterSpacing: 8,
  },
  deltaSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: verticalScale(8),
    gap: verticalScale(4),
  },
  deltaPercent: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(34),
    fontFamily: CARD_FONTS.accent,
    marginTop: verticalScale(10),
  },
  deltaArrow: {
    width: verticalScale(22),
    height: verticalScale(22),
  },
  deltaArrowFlipped: {
    transform: [{ rotate: '180deg' }],
  },
  deltaCaption: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(14),
    fontFamily: CARD_FONTS.medium,
    marginTop: verticalScale(4),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: verticalScale(28),
    paddingBottom: verticalScale(8),
  },
  statLabel: {
    fontSize: verticalScale(13),
    opacity: 0.75,
  },
  statValue: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(22),
    fontFamily: CARD_FONTS.bold,
    letterSpacing: 0.5,
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
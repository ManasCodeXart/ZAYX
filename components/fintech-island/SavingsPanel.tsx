import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { ISLAND } from './constants/island'
import { verticalScale } from './constants/scaling'
import type { SavingsData } from './constants/types'

interface SavingsPanelProps {
  data:        SavingsData
  interactive: boolean
}

export const SavingsPanel: React.FC<SavingsPanelProps> = ({
  data,
  interactive,
}) => {
  const symbol   = data.currencySymbol ?? '$'
  const progress = data.goalTarget > 0 ? Math.min(data.totalSaved / data.goalTarget, 1) : 0
  const percent  = Math.round(progress * 100)

  return (
    <Animated.View
      style={styles.card}
      pointerEvents={interactive ? 'box-none' : 'none'}
    >
      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>Goal</Text>
        <Text style={styles.goalName} numberOfLines={1}>{data.goalName}</Text>
      </View>

      <Text style={styles.amount}>
        {symbol}{data.totalSaved.toLocaleString('en-US')}
      </Text>
      <Text style={styles.amountSub}>total saved</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` as any }]} />
      </View>

      <View style={styles.progressMeta}>
        <Text style={styles.percentText}>{percent}% of goal</Text>
        <Text style={styles.targetText}>
          {symbol}{data.goalTarget.toLocaleString('en-US')}
        </Text>
      </View>

      {data.onViewSavings && (
        <Pressable
          style={({ pressed }) => [
            styles.ctaBtn,
            pressed && styles.ctaBtnPressed,
          ]}
          onPress={data.onViewSavings}
          hitSlop={6}
        >
          <Text style={styles.ctaText}>View Savings</Text>
        </Pressable>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    width:             ISLAND.CARD2.width,
    backgroundColor:   '#141414f3',
    borderRadius:      ISLAND.CARD2.radius,
    paddingHorizontal: verticalScale(16),
    paddingTop:        verticalScale(14),
    paddingBottom:     verticalScale(16),
    borderWidth:       0.5,
    borderColor:       '#ffffff2a',
  },
  goalRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   verticalScale(10),
  },
  goalLabel: {
    color:         '#555',
    fontSize:      verticalScale(11),
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  goalName: {
    color:      '#FFF',
    fontSize:   verticalScale(13),
    fontFamily: 'SpaceGroteskMedium',
  },
  amount: {
    color:         '#FFF',
    fontSize:      verticalScale(28),
    fontFamily:    'SpaceGroteskMedium',
    letterSpacing: -0.5,
  },
  amountSub: {
    color:        '#555',
    fontSize:     verticalScale(11),
    marginTop:    verticalScale(2),
    marginBottom: verticalScale(12),
  },
  progressTrack: {
    width:           '100%',
    height:          verticalScale(4),
    backgroundColor: '#2A2A2A',
    borderRadius:    verticalScale(2),
    overflow:        'hidden',
    marginBottom:    verticalScale(6),
  },
  progressFill: {
    height:          '100%',
    backgroundColor: '#22c55e',
    borderRadius:    verticalScale(2),
  },
  progressMeta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   verticalScale(14),
  },
  percentText: {
    color:      '#22c55e',
    fontSize:   verticalScale(11),
    fontFamily: 'SpaceGroteskMedium',
  },
  targetText: {
    color:    '#555',
    fontSize: verticalScale(11),
  },
  ctaBtn: {
    backgroundColor: '#2A2A2A',
    paddingVertical: verticalScale(8),
    borderRadius:    verticalScale(12),
    alignItems:      'center',
  },
  ctaBtnPressed: {
    backgroundColor: '#333',
  },
  ctaText: {
    color:      '#CCC',
    fontSize:   verticalScale(13),
    fontFamily: 'SpaceGroteskMedium',
  },
})
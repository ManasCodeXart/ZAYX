import React from 'react'
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { ISLAND } from './constants/island'
import { verticalScale } from './constants/scaling'
import type { RecentTransaction } from './constants/types'


interface SendPanelProps {
  transactions: RecentTransaction[]
  interactive: boolean
  onSendAgain?: (tx: RecentTransaction) => void
}



export const SendPanel: React.FC<SendPanelProps> = ({
  transactions,
  interactive,
  onSendAgain,
}) => {
  return (
    <Animated.View
      style={styles.card}
      pointerEvents={interactive ? 'box-none' : 'none'}
    >
      <Text style={styles.sectionLabel}>Frequent</Text>

      {transactions.slice(0, 4).map((tx) => (
        <TransactionRow
          key={tx.id}
          tx={tx}
          onSendAgain={() => onSendAgain?.(tx)}
        />
      ))}
    </Animated.View>
  )
}



const TransactionRow: React.FC<{
  tx: RecentTransaction
  onSendAgain: () => void
}> = ({ tx, onSendAgain }) => {
  return (
  <View style={styles.row}>
    <View style={styles.avatar}>
      {tx.avatarSource && (
        <Image
          source={tx.avatarSource}
          style={styles.avatarImage}
        />
      )}
    </View>
      <View style={styles.txInfo}>
        <Text style={styles.txName} numberOfLines={1}>{tx.name}</Text>
        <Text style={styles.txHandle} numberOfLines={1}>{tx.handle}</Text>
      </View>
      <Text style={styles.txAmount}>
        {tx.currency}{tx.amount.toFixed(2)}
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.sendAgainBtn,
          pressed && styles.sendAgainBtnPressed,
        ]}
        onPress={onSendAgain}
        hitSlop={6}
      >
        <Text style={styles.sendAgainText}>Send Again</Text>
      </Pressable>
    </View>
  )
}



const styles = StyleSheet.create({
  card: {
    width:           ISLAND.CARD2.width,
    backgroundColor: '#141414f3',
    borderRadius:    ISLAND.CARD2.radius,
    paddingHorizontal: verticalScale(16),
    paddingTop:        verticalScale(14),
    paddingBottom:     verticalScale(16),
    zIndex: 998,
    borderWidth:0.5,
    borderColor: '#ffffff2a'
  },
  sectionLabel: {
    color:          '#555',
    fontSize:       verticalScale(11),
    fontWeight:     '600',
    textTransform:  'uppercase',
    letterSpacing:  0.8,
    marginBottom:   verticalScale(12),
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           verticalScale(10),
    marginBottom:  verticalScale(12),
  },
  avatar: {
    width:           verticalScale(34),
    height:          verticalScale(34),
    borderRadius:    verticalScale(17),
    backgroundColor: '#2A2A2A',
    justifyContent:  'center',
    alignItems:      'center',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    color:      '#FFF',
    fontSize:   verticalScale(14),
    fontFamily: 'SpaceGroteskMedium'
  },
  txHandle: {
    color:     '#555',
    fontSize:  verticalScale(12),
    marginTop: verticalScale(1),
  },
  txAmount: {
    color:      '#FFF',
    fontSize:   verticalScale(13),
    fontFamily: 'SpaceGroteskMedium'
  },
  sendAgainBtn: {
    backgroundColor:  '#2A2A2A',
    paddingHorizontal: verticalScale(10),
    paddingVertical:   verticalScale(6),
    borderRadius:      verticalScale(15),
  },
  sendAgainBtnPressed: {
    backgroundColor: '#333',
  },
  sendAgainText: {
    color:      '#CCC',
    fontSize:   verticalScale(11),
    fontFamily: 'SpaceGroteskMedium'
  },


  avatarImage: {
  width:        '100%',
  height:       '100%',
  borderRadius: verticalScale(17),
},
})

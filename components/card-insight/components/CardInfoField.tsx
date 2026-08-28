import { CARD_COLORS, CARD_FONTS } from '../constants/card3d'
import { verticalScale } from '../constants/scaling'
import type { CardInfoFieldProps } from '../constants/types'
import { StyleSheet, Text, View } from 'react-native'

const CardInfoField = ({ label, align = 'left', labelStyle, ...rest }: CardInfoFieldProps) => (
  <View style={align === 'right' ? styles.alignEnd : undefined}>
    <Text style={[styles.label, labelStyle]}>{label}</Text>
    {rest.valueNode ?? <Text style={[styles.value, rest.valueStyle]}>{rest.value}</Text>}
  </View>
)

export default CardInfoField

const styles = StyleSheet.create({
  alignEnd: {
    alignItems: 'flex-end',
  },
  label: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(12),
    fontFamily: CARD_FONTS.medium,
    marginBottom: verticalScale(4),
  },
  value: {
    color: CARD_COLORS.text,
    fontSize: verticalScale(16),
    fontFamily: CARD_FONTS.bold,
    letterSpacing: 1,
  },
})
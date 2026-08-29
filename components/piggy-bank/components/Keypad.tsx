import * as Haptics from 'expo-haptics'
import { memo, useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { KeypadProps } from '../constants/types'
import { fireHaptic } from '../utils/haptics'



const KEYPAD_ROWS: readonly string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'delete'],
]

const DELETE_GLYPH = '⌫'

const DISABLED_OPACITY = 0.35



const Keypad = memo(function Keypad({
  onKeyPress,
  decimalSeparator = '.',
  hapticsEnabled = true,
  disabled = false,
  containerStyle,
  keyStyle,
  keyTextStyle,
}: KeypadProps) {
  const handleKeyPress = useCallback(
    (key: string) => {
      if (disabled) return

      if (hapticsEnabled) fireHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light))
      onKeyPress(key === '.' ? decimalSeparator : key)
    },
    [onKeyPress, decimalSeparator, hapticsEnabled, disabled],
  )

  return (
    <View style={[styles.container, containerStyle]}>
      {KEYPAD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
  key={key}
  style={[styles.key, keyStyle, disabled && styles.keyDisabled]}
  activeOpacity={0.6}
  disabled={disabled}
  onPress={() => handleKeyPress(key)}
  accessibilityRole="button"
  accessibilityLabel={key === 'delete' ? 'Delete' : undefined}
>
  <Text style={[styles.keyText, keyTextStyle]}>
    {key === 'delete' ? DELETE_GLYPH : key === '.' ? decimalSeparator : key}
  </Text>
</TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  )
})

Keypad.displayName = 'Keypad'

export default Keypad



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: {
    opacity: DISABLED_OPACITY,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
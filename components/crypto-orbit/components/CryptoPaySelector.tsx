import { useRef } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { verticalScale } from '../../utils/scaling'
import {
  BUTTON_HEIGHT,
  BUTTON_RADIUS,
  BUTTON_WIDTH,
  DEFAULT_BACKDROP_COLOR,
} from '../constants'
import { DEFAULT_COINS } from '../constants/defaultCoins'
import type { Coin } from '../constants/types'
import { useCoinGesture } from '../hooks/useCoinGesture'
import CoinBubble from './CoinBubble'

export interface CryptoPaySelectorProps {
  readonly coins?: readonly Coin[]
  readonly idleLabel?: string
  readonly hitRadius?: number
  readonly hapticsEnabled?: boolean
  readonly showBackdrop?: boolean
  readonly backdropColor?: string
  readonly bottomOffset?: number
  readonly onActiveChange?: (isActive: boolean) => void
  readonly onSelect: (coin: Coin) => void
  readonly containerStyle?: StyleProp<ViewStyle>
  readonly buttonStyle?: StyleProp<ViewStyle>
  readonly labelStyle?: StyleProp<TextStyle>
}

export function CryptoPaySelector({
  coins = DEFAULT_COINS,
  idleLabel = 'Pay',
  hitRadius,
  hapticsEnabled = true,
  showBackdrop = true,
  backdropColor = DEFAULT_BACKDROP_COLOR,
  bottomOffset = 0,
  onActiveChange,
  onSelect,
  containerStyle,
  buttonStyle,
  labelStyle,
}: CryptoPaySelectorProps) {
  const buttonRef = useRef<View>(null)

  const {
    gesture,
    activeIndex,
    activeCoinId,
    revealProgress,
    backdropOpacity,
    buttonLayout,
  } = useCoinGesture({
    coins,
    hitRadius,
    hapticsEnabled,
    onActiveChange,
    onSelect,
  })

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const activeCoin = activeCoinId
    ? coins.find((coin) => coin.id === activeCoinId)
    : undefined

  const activeLabel = activeCoin?.symbol ?? idleLabel

  const handleButtonLayout = () => {
    buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      buttonLayout.value = {
        x: pageX + width / 2,
        y: pageY + height / 2,
      }
    })
  }

  return (
    <View style={[styles.container, containerStyle]} pointerEvents="box-none">
      {showBackdrop && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: backdropColor },
            backdropStyle,
          ]}
        />
      )}

      <View style={styles.coinsArea} pointerEvents="none">
        {coins.map((coin, index) => (
          <CoinBubble
            key={coin.id}
            coin={coin}
            index={index}
            activeIndex={activeIndex}
            revealProgress={revealProgress}
          />
        ))}
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          ref={buttonRef}
          onLayout={handleButtonLayout}
          style={[
            styles.button,
            { marginBottom: bottomOffset },
            buttonStyle,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            activeCoinId ? `Pay with ${activeLabel}` : idleLabel
          }
        >
          <Text style={[styles.label, labelStyle]}>{activeLabel}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

export default CryptoPaySelector

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(55),
  },
  coinsArea: {
    position: 'absolute',
    bottom: verticalScale(30),
    alignSelf: 'center',
    width: 0,
    height: 0,
    overflow: 'visible',
  },
  button: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderRadius: BUTTON_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: verticalScale(18),
    fontWeight: '500',
    color: '#ffffff',
  },
})
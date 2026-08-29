import type { ImageSourcePropType, StyleProp, TextStyle, ViewStyle } from 'react-native'

// A single falling coin instance.
export type GravityCoinProps = Readonly<{
  id: string
  slotX: number
  slotY: number
  offsetX: number
  delay: number
  //  Coin artwork. Defaults to the bundled coin asset if omitted.
  coinSource?: ImageSourcePropType
  // Called once when the coin reaches the slot and finishes absorbing.
  onLanded: (id: string) => void
}>

// Imperative handle exposed by {@link PiggyBank} for triggering reactive animations.
export type PiggyBankRef = Readonly<{
  jiggle: () => void
  proudPuff: () => void
}>

export type PiggyBankProps = Readonly<{
  source: ImageSourcePropType
  size: number
  onSlotMeasured: (slotX: number, slotY: number) => void
  hapticsEnabled?: boolean
}>

export type QuickAmountPill = Readonly<{
  label: string
  value: number
}>

/** Public props for the {@link GravitySavings} component. */
export type GravitySavingsProps = Readonly<{
  currentSavings: number
  userName: string
  userAvatar?: ImageSourcePropType
  currencySymbol?: string
  quickAmounts?: readonly QuickAmountPill[]
  onSave: (amount: number) => Promise<void>
  onDone?: () => void
  onReturnHome?: () => void
  
    // Called if onSave doesn't resolve within SAVE_CONFIRMATION_TIMEOUT
    // after the last coin lands, or if onSave rejects.
   
  onError?: (error: unknown) => void
  hapticsEnabled?: boolean
}>

export type CoinDropState = 'idle' | 'dropping' | 'success' | 'error'

export type SpawnedCoin = Readonly<{
  id: string
  offsetX: number
  delay: number
  landed: boolean
}>

export type SuccessSheetProps = Readonly<{
  visible: boolean
  amount: number
  currencySymbol: string
  userName: string
  userAvatar?: ImageSourcePropType
  onDone: () => void
  onReturnHome?: () => void
}>

export type AnimatedCounterProps = Readonly<{
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  delay?: number
  decimals?: number
  style?: StyleProp<TextStyle>
}>

/** Props for the Keypad component. */
export type KeypadProps = Readonly<{
  //  Called with the pressed key: a digit, the decimal separator, or 'delete'.
  onKeyPress: (key: string) => void
  //  Character shown and emitted for the decimal key. Defaults to '.'.
  decimalSeparator?: string
  // Whether each keypress triggers a light haptic tap. Defaults to true. 
  hapticsEnabled?: boolean
  disabled?: boolean
  containerStyle?: StyleProp<ViewStyle>
  keyStyle?: StyleProp<ViewStyle>
  keyTextStyle?: StyleProp<TextStyle>
}>
import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { verticalScale } from '../constants/scaling'
import {
  COIN_STAGGER_DELAY,
  DEFAULT_QUICK_AMOUNTS,
  MAX_COIN_SPREAD,
  PIGGY_SIZE,
  SAVE_CONFIRMATION_TIMEOUT,
  SLOT_CENTER_X,
  getCoinCount,
} from '../constants/tuning'
import type {
  CoinDropState,
  GravitySavingsProps,
  PiggyBankRef,
  SpawnedCoin,
} from '../constants/types'
import AnimatedCounter from './AnimatedCounter'
import Coin from './Coin'
import Keypad from './Keypad'
import PiggyBank from './PiggyBank'
import SuccessSheet from './SuccessSheet'


const PIGGY_BANK_SOURCE = require('../assets/images/PiggyBank.png')



const AVATAR_SIZE = verticalScale(36)
const PILL_HEIGHT = verticalScale(38)
const MAX_AMOUNT_DIGITS = 7
const DECIMAL_SEPARATOR = '.'
const MAX_DECIMAL_DIGITS = 2
const SAVINGS_COUNTER_DURATION = 800
const AMOUNT_COUNTER_DURATION = 200

const SAVE_SPINNER_SIZE = verticalScale(18)
const SAVE_SPINNER_ROTATION_DURATION = 900
const SAVE_BUTTON_CROSSFADE_DURATION = 160

// Internal types 


type DropCoordinator = {
  landedCount: number
  totalCoins: number
  isApiResolved: boolean
  isLastCoinLanded: boolean
  isSettled: boolean
  savedAmount: number
  // Confirmation timeout — only started once the last coin lands and
  // onSave still hasn't answered. See handleCoinLanded.
  timeoutTimer: ReturnType<typeof setTimeout> | null
}

const createDropCoordinator = (): DropCoordinator => ({
  landedCount: 0,
  totalCoins: 0,
  isApiResolved: false,
  isLastCoinLanded: false,
  isSettled: false,
  savedAmount: 0,
  timeoutTimer: null,
})

const clearDropTimeout = (coordinator: DropCoordinator) => {
  if (coordinator.timeoutTimer === null) return
  clearTimeout(coordinator.timeoutTimer)
  coordinator.timeoutTimer = null
}


function SaveButtonSpinner() {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: SAVE_SPINNER_ROTATION_DURATION, easing: Easing.linear }),
      -1,
      false,
    )
    return () => cancelAnimation(rotation)
  }, [])

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }))

  return <Animated.View style={[styles.saveSpinner, spinnerStyle]} />
}



const GravitySavings = ({
  currentSavings,
  userName,
  userAvatar,
  currencySymbol = '$',
  quickAmounts = DEFAULT_QUICK_AMOUNTS,
  hapticsEnabled = true,
  onSave,
  onDone,
  onReturnHome,
  onError,
}: GravitySavingsProps) => {
  const insets = useSafeAreaInsets()

  const [amount, setAmount] = useState('0')
  const [savedAmount, setSavedAmount] = useState(0)
  const [coins, setCoins] = useState<readonly SpawnedCoin[]>([])
  const [dropState, setDropState] = useState<CoinDropState>('idle')
  const [showSuccess, setShowSuccess] = useState(false)
  const [slotX, setSlotX] = useState(SLOT_CENTER_X)
  const [slotY, setSlotY] = useState(0)

  const piggyRef = useRef<PiggyBankRef>(null)
  const dropRef = useRef<DropCoordinator>(createDropCoordinator())
  const isMountedRef = useRef(true)

  
  const isSavingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearDropTimeout(dropRef.current)
    }
  }, [])

  const handleSlotMeasured = useCallback((x: number, y: number) => {
    setSlotX(x)
    setSlotY(y)
  }, [])

  const handleKeypadPress = useCallback((key: string) => {
    if (key === 'delete') {
      setAmount((prev) => prev.slice(0, -1) || '0')
      return
    }

    if (key === DECIMAL_SEPARATOR) {
      setAmount((prev) => (prev.includes(DECIMAL_SEPARATOR) ? prev : `${prev}${DECIMAL_SEPARATOR}`))
      return
    }

    setAmount((prev) => {
      const decimalIndex = prev.indexOf(DECIMAL_SEPARATOR)
      const decimalDigits = decimalIndex === -1 ? 0 : prev.length - decimalIndex - 1
      if (decimalDigits >= MAX_DECIMAL_DIGITS) return prev

      const next = prev === '0' ? key : prev + key
      return next.length <= MAX_AMOUNT_DIGITS ? next : prev
    })
  }, [])

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(String(value))
  }, [])

  const completeDrop = useCallback(() => {
    const coordinator = dropRef.current
    if (coordinator.isSettled) return
    coordinator.isSettled = true
    clearDropTimeout(coordinator)

    isSavingRef.current = false
    setSavedAmount(coordinator.savedAmount)
    piggyRef.current?.proudPuff()
    setDropState('success')
    setShowSuccess(true)
  }, [])

  const failDrop = useCallback(
    (error: unknown) => {
      const coordinator = dropRef.current
      if (coordinator.isSettled) return
      coordinator.isSettled = true
      clearDropTimeout(coordinator)

      isSavingRef.current = false
      setDropState('error')
      setCoins([])
      onError?.(error)
    },
    [onError],
  )

  const handleCoinLanded = useCallback(
    (id: string) => {
      piggyRef.current?.jiggle()
      setCoins((prev) => prev.map((coin) => (coin.id === id ? { ...coin, landed: true } : coin)))

      const coordinator = dropRef.current
      coordinator.landedCount += 1
      if (coordinator.landedCount !== coordinator.totalCoins) return

      coordinator.isLastCoinLanded = true

      if (coordinator.isApiResolved) {
        completeDrop()
        return
      }

      if (coordinator.isSettled) return

      // Animation is done but onSave hasn't answered yet — the confirmation
      // clock only starts now, matching the onError contract.
      coordinator.timeoutTimer = setTimeout(() => {
        if (dropRef.current !== coordinator) return
        failDrop(new Error(`Save confirmation timed out after ${SAVE_CONFIRMATION_TIMEOUT}ms`))
      }, SAVE_CONFIRMATION_TIMEOUT)
    },
    [completeDrop, failDrop],
  )

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return

    const numericAmount = parseFloat(amount)
    if (!numericAmount || numericAmount <= 0) return

    const coinCount = getCoinCount(numericAmount)
    if (coinCount === 0) return

    isSavingRef.current = true
    const coordinator: DropCoordinator = {
      ...createDropCoordinator(),
      totalCoins: coinCount,
      savedAmount: numericAmount,
    }
    dropRef.current = coordinator

    setCoins(
      Array.from({ length: coinCount }, (_, index) => ({
        id: `coin-${Date.now()}-${index}`,
        offsetX: (Math.random() * 2 - 1) * MAX_COIN_SPREAD,
        delay: index * COIN_STAGGER_DELAY,
        landed: false,
      })),
    )
    setDropState('dropping')

    try {
      await onSave(numericAmount)
      if (!isMountedRef.current || dropRef.current !== coordinator) return

      coordinator.isApiResolved = true
      if (coordinator.isLastCoinLanded) completeDrop()
    } catch (error) {
      if (!isMountedRef.current || dropRef.current !== coordinator) return

      failDrop(error)
    }
  }, [amount, onSave, completeDrop, failDrop])

  const handleDone = useCallback(() => {
    isSavingRef.current = false
    setShowSuccess(false)
    setDropState('idle')
    setCoins([])
    setAmount('0')
    onDone?.()
  }, [onDone])

  const handleReturnHome = useCallback(() => {
    isSavingRef.current = false
    setShowSuccess(false)
    setDropState('idle')
    setCoins([])
    onReturnHome?.()
  }, [onReturnHome])

  const isSaving = dropState === 'dropping'

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.piggyContainer}>
       <PiggyBank
  ref={piggyRef}
  source={PIGGY_BANK_SOURCE}
  size={PIGGY_SIZE}
  onSlotMeasured={handleSlotMeasured}
  hapticsEnabled={hapticsEnabled}
/>
      </View>

      {coins.map((coin) => (
        <Coin
          key={coin.id}
          id={coin.id}
          slotX={slotX}
          slotY={slotY}
          offsetX={coin.offsetX}
          delay={coin.delay}
          onLanded={handleCoinLanded}
        />
      ))}

      <View style={styles.savingsRow}>
        {userAvatar && <Image source={userAvatar} style={styles.avatar} />}

        <View style={styles.savingsTextGroup}>
          <Text style={styles.savingsLabel}>Current Savings</Text>
          <View style={styles.inlineAmountRow}>
            <Text style={styles.savingsPrefix}>{currencySymbol}</Text>
            <AnimatedCounter
              value={currentSavings}
              duration={SAVINGS_COUNTER_DURATION}
              style={styles.savingsAmount}
            />
          </View>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.dollarSign}>{currencySymbol}</Text>
        <AnimatedCounter
          value={parseFloat(amount) || 0}
          duration={AMOUNT_COUNTER_DURATION}
          style={styles.amountText}
        />
      </View>

      <View style={styles.pillsRow}>
        {quickAmounts.map((pill) => (
          <TouchableOpacity
            key={pill.label}
            style={styles.pill}
            activeOpacity={0.7}
            disabled={isSaving}
            onPress={() => handleQuickAmount(pill.value)}
          >
            <Text style={styles.pillText}>{pill.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.numpadSection, { paddingBottom: insets.bottom + verticalScale(8) }]}>
        <Keypad
  onKeyPress={handleKeypadPress}
  decimalSeparator={DECIMAL_SEPARATOR}
  hapticsEnabled={hapticsEnabled}
  disabled={isSaving}
  containerStyle={styles.numpadContainer}
  keyStyle={styles.numpadButton}
  keyTextStyle={styles.numpadButtonText}
/>

        <TouchableOpacity
  style={styles.saveButton}
  activeOpacity={0.85}
  disabled={isSaving}
  onPress={handleSave}
  accessibilityRole="button"
  accessibilityLabel={isSaving ? 'Saving' : 'Save'}
  accessibilityState={{ busy: isSaving, disabled: isSaving }}
>

          <View style={styles.saveButtonContent}>
            {isSaving ? (
              <Animated.View
                key="spinner"
                entering={FadeIn.duration(SAVE_BUTTON_CROSSFADE_DURATION)}
                exiting={FadeOut.duration(SAVE_BUTTON_CROSSFADE_DURATION)}
              >
                <SaveButtonSpinner />
              </Animated.View>
            ) : (
              <Animated.Text
                key="label"
                entering={FadeIn.duration(SAVE_BUTTON_CROSSFADE_DURATION)}
                exiting={FadeOut.duration(SAVE_BUTTON_CROSSFADE_DURATION)}
                style={styles.saveButtonText}
              >
                Save
              </Animated.Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <SuccessSheet
        visible={showSuccess}
        amount={savedAmount}
        currencySymbol={currencySymbol}
        userName={userName}
        userAvatar={userAvatar}
        onDone={handleDone}
        onReturnHome={onReturnHome ? handleReturnHome : undefined}
      />
    </View>
  )
}

export default GravitySavings


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  piggyContainer: {
    width: PIGGY_SIZE,
    height: verticalScale(280),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(4),
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: verticalScale(10),
    marginTop: verticalScale(4),
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  savingsTextGroup: {
    gap: verticalScale(2),
  },
  savingsLabel: {
    color: '#888888',
    fontSize: verticalScale(11),
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  inlineAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsPrefix: {
    color: '#FFFFFF',
    fontSize: verticalScale(15),
    fontWeight: '400',
  },
  savingsAmount: {
    color: '#FFFFFF',
    fontSize: verticalScale(15),
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: verticalScale(10),
  },
  dollarSign: {
    color: '#FFFFFF',
    fontSize: verticalScale(50),
    fontWeight: '500',
    lineHeight: verticalScale(58),
    marginBottom: verticalScale(4),
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: verticalScale(64),
    fontWeight: '500',
    lineHeight: verticalScale(70),
    letterSpacing: -1,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: verticalScale(10),
    marginTop: verticalScale(18),
    paddingHorizontal: verticalScale(24),
  },
  pill: {
    flex: 1,
    height: PILL_HEIGHT,
    backgroundColor: '#141414',
    borderRadius: verticalScale(20),
    borderWidth: 1,
    borderColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: verticalScale(13),
    fontWeight: '600',
  },
  numpadSection: {
    flex: 1,
    width: '100%',
    marginTop: verticalScale(12),
    paddingHorizontal: verticalScale(16),
  },
  numpadContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: verticalScale(10),
  },
  numpadButton: {
    backgroundColor: '#1a1919',
    borderRadius: verticalScale(14),
    margin: verticalScale(4),
  },
  numpadButtonText: {
    color: '#FFFFFF',
    fontSize: verticalScale(22),
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3d3d3d',
    borderRadius: verticalScale(25),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    marginBottom: verticalScale(8),
    marginHorizontal: verticalScale(20),
  },
  saveButtonContent: {
    height: verticalScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#e7e7e7',
    fontSize: verticalScale(15),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  saveSpinner: {
    width: SAVE_SPINNER_SIZE,
    height: SAVE_SPINNER_SIZE,
    borderRadius: SAVE_SPINNER_SIZE / 2,
    borderWidth: 2.5,
    borderColor: 'rgba(124, 124, 124, 0.15)',
    borderTopColor: '#999999',
  },
})
import LottieView from 'lottie-react-native'
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
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
import type { FintechIslandProps, FintechIslandRef, IslandState } from './constants/types'
import { VARIANT_CONFIG } from './constants/variants'
import { useIslandAnimation } from './hooks/useIslandAnimation'
import { CardCarousel } from './CardCarousel'
import { SavingsPanel } from './SavingsPanel'
import { SendPanel } from './SendPanel'


const AnimatedLottieView = Animated.createAnimatedComponent(LottieView)

const AUTO_DISMISS_DELAY = 1868

export const FintechIsland = React.forwardRef<FintechIslandRef, FintechIslandProps>(
  (props, ref) => {
    const { visible, onDismiss } = props
    const variant = props.variant ?? 'send'

    const [jsState, setJsState] = useState<IslandState>('hidden')
   
    const [keepExpanded, setKeepExpanded] = useState(false)
   
    const [animReady, setAnimReady] = useState(false)

    const animReadyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const successTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)

    
    const userInteracted = useRef(false)

    const {
      islandState,
      morphStyle,
      containerStyle,
      lottieAnimatedProps,
      pillContentStyle,
      card1ContentStyle,
      card2Style,
      reset,
      showCompact,
      showExpanded,
      showSuccess,
      dismiss,
    } = useIslandAnimation(() => {
      setJsState('hidden')
      setAnimReady(false)
      onDismiss?.()
    })

    
    const dismissRef = useRef<() => void>(() => {})

    

    useImperativeHandle(ref, () => ({
      triggerSuccess: handleSuccess,
      dismiss:        () => dismissRef.current(),
    }))

    

    const clearAutoDismiss = useCallback(() => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current)
        autoDismissTimer.current = null
      }
    }, [])

    const scheduleAutoDismiss = useCallback(() => {
      clearAutoDismiss()
      const delay = VARIANT_CONFIG[variant].autoResolves
        ? Math.max(AUTO_DISMISS_DELAY, VARIANT_CONFIG[variant].lottieDuration)
        : AUTO_DISMISS_DELAY
      autoDismissTimer.current = setTimeout(() => {
        
        if (!userInteracted.current && islandState.value === 'compact') {
          dismissRef.current()
        }
      }, delay)
    }, [clearAutoDismiss, variant])

   

    useEffect(() => {
      if (visible) {
  userInteracted.current = false
  setKeepExpanded(false)
  setAnimReady(false)
  reset()
  setJsState('compact')

  animReadyTimer.current = setTimeout(() => {
  setAnimReady(true)
  showCompact(
    true,
    VARIANT_CONFIG[variant].autoResolves ? 'playOnce' : 'loop',
    VARIANT_CONFIG[variant].lottieDuration,
  )
  scheduleAutoDismiss()
}, 50)

} else {
  dismissRef.current()
}

return () => {
  clearAutoDismiss()
  if (successTimer.current) clearTimeout(successTimer.current)
  if (animReadyTimer.current) clearTimeout(animReadyTimer.current)
}
    }, [visible, variant, reset, showCompact, scheduleAutoDismiss])

    
    const handleDismiss = useCallback(() => {
      clearAutoDismiss()
      if (successTimer.current) clearTimeout(successTimer.current)
      setJsState('dismissing')
      dismiss()
    }, [clearAutoDismiss, dismiss])

    
    useEffect(() => {
      dismissRef.current = handleDismiss
    }, [handleDismiss])

    const handlePillPress = useCallback(() => {
      if (jsState !== 'compact') return
      userInteracted.current = true   
      clearAutoDismiss()
      setJsState('expanded')
      showExpanded()
    }, [jsState, clearAutoDismiss, showExpanded])

    const handleBackdropPress = useCallback(() => {
      if (jsState === 'expanded') {
        if (VARIANT_CONFIG[variant].collapseToCompact) {
          setJsState('compact')
          showCompact()
        } else {
          handleDismiss()
        }
        return
      }
      if (jsState === 'success' && keepExpanded) {
        handleDismiss()
      }
    }, [jsState, variant, keepExpanded, showCompact, handleDismiss])

    const handleSuccess = useCallback(() => {
      // "cardAdded" is born already resolved — no pending step to resolve into.
      if (VARIANT_CONFIG[variant].autoResolves) return

      clearAutoDismiss()
      const wasExpanded = jsState === 'expanded'
      setKeepExpanded(wasExpanded)
      setJsState('success')
      showSuccess(wasExpanded)

      if (!wasExpanded) {
        successTimer.current = setTimeout(() => dismissRef.current(), 1700)
      }
    }, [clearAutoDismiss, showSuccess, jsState, variant])

   

    const pillLabel = useMemo(() => {
      const amount = props.variant === 'send'
        ? `${props.transaction.currency}${props.transaction.amount}`
        : undefined
      return VARIANT_CONFIG[variant].pillLabel(jsState, amount)
    }, [jsState, variant, props])

    const card1Data = useMemo(() => {
      if (props.variant === 'cardAdded') {
        return {
          avatar:   props.cardAdded.cardholderAvatar,
          title:    props.cardAdded.cardholderName,
          subtitle: props.cardAdded.cardholderHandle,
          label:    'Card Balance',
          amount:   `${props.cardAdded.currencySymbol ?? '$'}${props.cardAdded.cardBalance}`,
        }
      }
      if (props.variant === 'savings') {
        return {
          avatar:   props.savings.goalImage,
          title:    props.savings.goalName,
          subtitle: `+${props.savings.currencySymbol ?? '$'}${props.savings.amountSaved} added`,
          label:    'Total Saved',
          amount:   `${props.savings.currencySymbol ?? '$'}${props.savings.totalSaved.toLocaleString('en-US')}`,
        }
      }
      return {
        avatar:   props.transaction.avatarSource,
        title:    props.transaction.recipientName,
        subtitle: props.transaction.recipientHandle,
        label:    jsState === 'success' ? 'Sent' : 'Sending',
        amount:   `${props.transaction.currency}${props.transaction.amount}`,
      }
    }, [jsState, props])

    

    if (jsState === 'hidden') return null

    const card2Top = ISLAND.HEADER_OFFSET + ISLAND.CARD1.height + ISLAND.CARD_GAP

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

        {(jsState === 'expanded' || (jsState === 'success' && keepExpanded)) && (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
          />
        )}

        <Animated.View
          style={[styles.islandWrapper, containerStyle, { top: ISLAND.HEADER_OFFSET }]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={handlePillPress}
            disabled={jsState !== 'compact'}
          >
            <Animated.View style={[styles.morphSurface, morphStyle]}>

              
              {animReady && (
                <>
                  
                  <Animated.View
                    style={[StyleSheet.absoluteFill, styles.contentLayer, pillContentStyle]}
                    pointerEvents="none"
                  >
                    <View style={styles.pillRow}>
                      <AnimatedLottieView
                        source={VARIANT_CONFIG[variant].lottieSource}
                        animatedProps={lottieAnimatedProps}
                        style={VARIANT_CONFIG[variant].lottieStyle}
                      />
                      <Text style={styles.pillLabel} numberOfLines={1}>
                        {pillLabel}
                      </Text>
                    </View>
                  </Animated.View>

                 
                  <Animated.View
                    style={[StyleSheet.absoluteFill, styles.contentLayer, card1ContentStyle]}
                    pointerEvents="none"
                  >
                    <View style={styles.card1Row}>
                      <View style={styles.card1Avatar}>
                        {card1Data.avatar && (
                          <Image
                            source={card1Data.avatar}
                            style={styles.card1AvatarImage}
                          />
                        )}
                      </View>
                      <View style={styles.recipientBlock}>
                        <Text style={styles.recipientName} numberOfLines={1}>
                          {card1Data.title}
                        </Text>
                        <Text style={styles.recipientHandle} numberOfLines={1}>
                          {card1Data.subtitle}
                        </Text>
                      </View>
                      <View style={styles.amountBlock}>
                        <Text style={styles.sendingLabel}>
                          {card1Data.label}
                        </Text>
                        <Text style={styles.card1Amount}>
                          {card1Data.amount}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                </>
              )}

            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View
          key={variant}
          style={[card2Style, { top: card2Top, position: 'absolute', alignSelf: 'center' }]}
          pointerEvents="box-none"
        >
          {props.variant === 'cardAdded' ? (
            <CardCarousel
              cards={props.cardAdded.cards}
              interactive={jsState === 'expanded' || (jsState === 'success' && keepExpanded)}
              onAddMore={props.onAddMore}
            />
          ) : props.variant === 'savings' ? (
            <SavingsPanel
              data={props.savings}
              interactive={jsState === 'expanded' || (jsState === 'success' && keepExpanded)}
            />
  ) : (
    <SendPanel
      transactions={props.transaction.recentTransactions}
      interactive={jsState === 'expanded' || (jsState === 'success' && keepExpanded)}
      onSendAgain={props.onSendAgain}
    />
  )}
</Animated.View>

      </View>
    )
  }
)

FintechIsland.displayName = 'FintechIsland'



const styles = StyleSheet.create({
  islandWrapper: {
    position:  'absolute',
    alignSelf: 'center',
    zIndex:    999,
  },
  morphSurface: {
    backgroundColor: '#141414',
    overflow:        'hidden',
    borderWidth:     0.5,
    borderColor:     '#ffffff2a',
  },
  contentLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems:     'center',
  },
  pillRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               0,
    paddingHorizontal: verticalScale(14),
  },
  pillLabel: {
    color:      '#FFF',
    fontSize:   verticalScale(14),
    fontFamily: 'SpaceGroteskMedium',
  },
  card1Row: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               verticalScale(12),
    width:             '100%',
    paddingHorizontal: verticalScale(16),
  },
  card1Avatar: {
    width:           verticalScale(46),
    height:          verticalScale(46),
    borderRadius:    verticalScale(23),
    backgroundColor: '#2A2A2A',
    justifyContent:  'center',
    alignItems:      'center',
  },
  card1AvatarText: {
    color:      '#888',
    fontSize:   verticalScale(14),
    fontWeight: '600',
  },
  recipientBlock: {
    flex: 1,
  },
  recipientName: {
    color:      '#FFF',
    fontSize:   verticalScale(16),
    fontFamily: 'SpaceGroteskMedium',
  },
  recipientHandle: {
    color:     '#555',
    fontSize:  verticalScale(13),
    marginTop: verticalScale(2),
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  sendingLabel: {
    color:    '#666',
    fontSize: verticalScale(11),
  },
  card1Amount: {
    color:      '#FFF',
    fontSize:   verticalScale(20),
    fontFamily: 'SpaceGroteskMedium',
  },
  card1AvatarImage: {
    width:        '100%',
    height:       '100%',
    borderRadius: verticalScale(23),
  },
})
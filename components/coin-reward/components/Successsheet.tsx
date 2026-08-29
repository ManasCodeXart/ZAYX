import { useEffect } from 'react'
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { verticalScale } from '../constants/theme'
import { SuccessSheetProps } from '../constants/types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// ─── Component ────────────────────────────────────────────────────────────────

const SuccessSheet = ({
  visible,
  amount,
  currencySymbol,
  userName,
  userAvatar,
  onDone,
  onReturnHome,
}: SuccessSheetProps) => {
  const insets   = useSafeAreaInsets()
  const slideY   = useSharedValue(SCREEN_HEIGHT)
  const backdropOpacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 250 })
      slideY.value = withSpring(0, { damping: 22, stiffness: 260 })
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 })
      slideY.value = withTiming(SCREEN_HEIGHT, { duration: 260 })
    }
  }, [visible])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDone}
    >
      {/* ── Dim backdrop ──────────────────────────────────────────────── */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDone}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      {/* ── Sheet ─────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: insets.bottom + verticalScale(12) }]}>

        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {userAvatar ? (
            <Image source={userAvatar} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback} />
          )}
        </View>

        {/* Username */}
        <Text style={styles.userName}>{userName}</Text>

        {/* Amount */}
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <Text style={styles.amountText}>{amount}</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Successfully added in your saving account</Text>

        {/* Done button */}
        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.85}
          onPress={onDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>

        {/* Return to Home */}
        <TouchableOpacity
          style={styles.returnButton}
          activeOpacity={0.6}
          onPress={onReturnHome}
        >
          <Text style={styles.returnButtonText}>Return to Home</Text>
        </TouchableOpacity>

      </Animated.View>
    </Modal>
  )
}

export default SuccessSheet

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111111',
    borderTopLeftRadius: verticalScale(28),
    borderTopRightRadius: verticalScale(28),
    alignItems: 'center',
    paddingTop: verticalScale(12),
    paddingHorizontal: verticalScale(24),
    gap: verticalScale(8),
  },

  handle: {
    width: verticalScale(36),
    height: verticalScale(4),
    borderRadius: verticalScale(2),
    backgroundColor: '#333333',
    marginBottom: verticalScale(8),
  },

  avatarWrapper: {
    marginTop: verticalScale(4),
  },

  avatar: {
    width: verticalScale(64),
    height: verticalScale(64),
    borderRadius: verticalScale(32),
  },

  avatarFallback: {
    width: verticalScale(64),
    height: verticalScale(64),
    borderRadius: verticalScale(32),
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  userName: {
    color: '#FFFFFF',
    fontSize: verticalScale(14),
    fontWeight: '500',
    marginTop: verticalScale(4),
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: verticalScale(2),
  },

  currencySymbol: {
    color: '#FFFFFF',
    fontSize: verticalScale(28),
   fontWeight: '600',
    lineHeight: verticalScale(48),
    marginBottom: verticalScale(2),
  },

  amountText: {
    color: '#FFFFFF',
    fontSize: verticalScale(48),
    fontWeight: '600',
    lineHeight: verticalScale(52),
    letterSpacing: -1,
  },

  subtitle: {
    color: '#666666',
    fontSize: verticalScale(12),
    fontWeight: '400',
    textAlign: 'center',
    marginTop: verticalScale(2),
  },

  doneButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: verticalScale(50),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    marginTop: verticalScale(16),
  },

  doneButtonText: {
    color: '#000000',
    fontSize: verticalScale(15),
     fontWeight: '600',
    letterSpacing: 0.2,
  },

  returnButton: {
    paddingVertical: verticalScale(8),
  },

  returnButtonText: {
    color: '#555555',
    fontSize: verticalScale(13),
    fontWeight: '600',
  },

})
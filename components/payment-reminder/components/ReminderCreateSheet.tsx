import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CURRENCY_PREFIX } from '../constants/currency';
import { EASE_OUT_EXPO, ENTRANCE_SPRING } from '../constants/motion';
import { verticalScale } from '../constants/scaling';
import type { Contact, PillData, ReminderCreateSheetProps } from '../constants/types';
import { daysInMonth, getReminderDateInfo } from '../utils/date';
import AmountKeypadSheet from './AmountKeypadSheet';
import AnimatedCounter from './AnimatedCounter';
import AvatarCarousel from './AvatarCarousel';
import DateScrollPicker from './DateScrollPicker';
import VerticalTickSlider from './VerticalTickSlider';

const AMOUNT_COUNTER_DURATION = 220;
const AMOUNT_COUNTER_DECIMALS = 0;
const CARD_BORDER_RADIUS = verticalScale(28);
const FLIGHT_DISTANCE = verticalScale(100) + verticalScale(52);


const AMOUNT_TEXT_SCALE = [
  { maxDigits: 4, fontSize: 50, letterSpacing: 0 },
  { maxDigits: 6, fontSize: 40, letterSpacing: 0 },
  { maxDigits: 9, fontSize: 30, letterSpacing: 0 },
  { maxDigits: Infinity, fontSize: 24, letterSpacing: -2 },
] as const;

interface AmountTextStyle {
  fontSize: number;
  letterSpacing: number;
}

function getAmountTextStyle(rawAmount: string): AmountTextStyle {
  const digitCount = rawAmount.replace(/[^0-9]/g, '').length;
  return AMOUNT_TEXT_SCALE.find((style) => digitCount <= style.maxDigits) ?? AMOUNT_TEXT_SCALE[0];
}

const ReminderCreateSheet = memo(function ReminderCreateSheet({
  contacts,
  buttonLabel = 'Set Reminder',
  initialIndex = 0,
  onPillCreate,
  open,
  onClose,
}: ReminderCreateSheetProps) {
  const isControlled = open !== undefined;
  const [visible, setVisible] = useState(false);
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts?.[initialIndex] ?? null);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [amount, setAmount] = useState('0');

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(verticalScale(30));
  const borderRadius = useSharedValue(CARD_BORDER_RADIUS);

 
  const resetCardTransform = useCallback(() => {
    scale.value = 0.85;
    opacity.value = 0;
    translateY.value = verticalScale(30);
    borderRadius.value = CARD_BORDER_RADIUS;
  }, [scale, opacity, translateY, borderRadius]);

  const runEntranceAnimation = useCallback(() => {
    scale.value = withSpring(1, ENTRANCE_SPRING);
    translateY.value = withSpring(0, ENTRANCE_SPRING);
    opacity.value = withTiming(1, { duration: 180, easing: EASE_OUT_EXPO });
  }, [scale, opacity, translateY]);


  const animateOut = useCallback((onFinished: () => void) => {
    opacity.value = withTiming(0, { duration: 140, easing: EASE_OUT_EXPO });
    translateY.value = withTiming(-FLIGHT_DISTANCE, { duration: 380, easing: EASE_OUT_EXPO });
    borderRadius.value = withTiming(verticalScale(50), { duration: 300, easing: EASE_OUT_EXPO });
    scale.value = withTiming(0.15, { duration: 400, easing: EASE_OUT_EXPO }, (finished) => {
      'worklet';
      if (finished) runOnJS(onFinished)();
    });
  }, [scale, opacity, translateY, borderRadius]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
    borderRadius: borderRadius.value,
  }));

  const latestProps = useRef({ contacts, initialIndex });

  useEffect(() => {
    latestProps.current = { contacts, initialIndex };
  }, [contacts, initialIndex]);

  const handleOpen = useCallback(() => {
    resetCardTransform();
  
    setSelectedContact(contacts?.[initialIndex] ?? null);
    setVisible(true);
  }, [resetCardTransform, contacts, initialIndex]);

  useEffect(() => {
    if (!isControlled) return;
    if (open) {
      resetCardTransform();
      setSelectedContact(latestProps.current.contacts?.[latestProps.current.initialIndex] ?? null);
      setVisible(true);
    } else {
      setKeypadVisible(false);
      setVisible(false);
    }
  }, [open, isControlled, resetCardTransform]);

  const handleDismiss = useCallback(() => {
    if (keypadVisible) {
      setKeypadVisible(false);
    } else {
      setVisible(false);
      onClose?.();
    }
  }, [keypadVisible, onClose]);

  const handleContactChange = useCallback((contact: Contact) => setSelectedContact(contact), []);
  const handleDateChange = useCallback((value: number) => setSelectedDate(value), []);

  const handleMonthChange = useCallback((value: number) => {
    setSelectedMonth(value);
    
    setSelectedDate((day) => Math.min(day, daysInMonth(new Date().getFullYear(), value)));
  }, []);

  const { dateLabel, countdownLabel, daysRemaining } = useMemo(
    () => getReminderDateInfo(selectedDate, selectedMonth),
    [selectedDate, selectedMonth]
  );

  const canSubmit = !!selectedContact && amount !== '0' && !isSubmitting;

  const amountStyle = useMemo(
    () => StyleSheet.flatten([styles.amountInput, getAmountTextStyle(amount)]),
    [amount]
  );

  const handleRemind = useCallback(() => {
    if (!selectedContact || amount === '0' || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setKeypadVisible(false);

    const pillData: PillData = {
      contact: selectedContact,
      amount,
      dateLabel,
      countdownLabel,
      daysRemaining,
    };

    const finalize = () => {
      onPillCreate(pillData);
      setVisible(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      resetCardTransform();
      onClose?.();
    };

    animateOut(finalize);
  }, [
    selectedContact,
    amount,
    dateLabel,
    countdownLabel,
    daysRemaining,
    onPillCreate,
    onClose,
    resetCardTransform,
    animateOut,
  ]);

  return (
    <>
      {!isControlled && (
        <TouchableOpacity style={styles.triggerButton} onPress={handleOpen} activeOpacity={0.8}>
          <Text style={styles.triggerLabel}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleDismiss}
        onShow={runEntranceAnimation}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
          <View style={styles.backdrop}>
            <Animated.View style={[styles.card, cardStyle]}>
              <AvatarCarousel
                contacts={contacts}
                initialIndex={initialIndex}
                onContactChange={handleContactChange}
                height={verticalScale(120)}
              />

              <View style={styles.mainRow}>
                <View style={[styles.sideColumn, styles.sideColumnFixedWidth]}>
                  <Text style={styles.label}>Date</Text>
                  <DateScrollPicker min={1} max={31} value={selectedDate} onValueChange={handleDateChange} />
                </View>

                <View style={styles.centerContent}>
                  <TouchableOpacity
                    style={styles.amountRow}
                    onPress={() => setKeypadVisible(true)}
                    activeOpacity={0.7}
                  >
                    <AnimatedCounter
                      value={parseFloat(amount)}
                      decimals={AMOUNT_COUNTER_DECIMALS}
                      duration={AMOUNT_COUNTER_DURATION}
                      prefix={CURRENCY_PREFIX}
                      style={amountStyle}
                    />
                  </TouchableOpacity>
                  <Text style={styles.dateLabel}>{dateLabel}</Text>
                  <Text style={styles.countdown}>{countdownLabel}</Text>
                </View>

                <View style={[styles.sideColumn, styles.sideColumnFixedWidth]}>
                  <Text style={styles.label}>Month</Text>
                  <VerticalTickSlider
                    value={selectedMonth}
                    onValueChange={handleMonthChange}
                    min={1}
                    max={12}
                    step={1}
                    width={verticalScale(54)}
                    height={verticalScale(160)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.remindButton, !canSubmit && styles.remindButtonDisabled]}
                activeOpacity={0.85}
                onPress={handleRemind}
                disabled={!canSubmit}
              >
                <Text style={styles.remindLabel}>Remind me</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <AmountKeypadSheet
            visible={keypadVisible}
            amount={amount}
            onAmountChange={setAmount}
          />
        </GestureHandlerRootView>
      </Modal>
    </>
  );
});

ReminderCreateSheet.displayName = 'ReminderCreateSheet';

export default ReminderCreateSheet;

const styles = StyleSheet.create({
  triggerButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: verticalScale(14),
    paddingHorizontal: verticalScale(28),
    borderRadius: verticalScale(50),
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  triggerLabel: {
    color: '#FFFFFF',
    fontSize: verticalScale(15),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: verticalScale(100),
  },
  card: {
    width: verticalScale(360),
    backgroundColor: '#141414f1',
    borderWidth: verticalScale(2),
    borderColor: '#ffffff1f',
    borderRadius: verticalScale(28),
    overflow: 'hidden',
    paddingTop: verticalScale(0),
    paddingBottom: verticalScale(10),
    gap: verticalScale(0),
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: verticalScale(12),
    marginTop: verticalScale(10),
  },
  sideColumn: {
    alignItems: 'center',
    gap: verticalScale(8),
  },
  sideColumnFixedWidth: {
   
    width: verticalScale(54),
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: verticalScale(15),
    fontFamily: 'SpaceGroteskMedium',
  },
  centerContent: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(8),
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInput: {
    color: '#FFFFFF',
    fontSize: verticalScale(64),
    fontFamily: 'SpaceGroteskSemiBold',
    fontVariant: ['tabular-nums'],
    textAlign: 'left',
  },
  dateLabel: {
    color: '#FFFFFF',
    fontSize: verticalScale(20),
    fontFamily: 'SpaceGroteskBold',
    textAlign: 'center',
  },
  countdown: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: verticalScale(19),
    fontFamily: 'SpaceGroteskBold',
    textAlign: 'center',
  },
  remindButton: {
    marginHorizontal: verticalScale(60),
    backgroundColor: '#FFFFFF',
    borderRadius: verticalScale(50),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  remindButtonDisabled: {
    opacity: 0.35,
  },
  remindLabel: {
    color: '#000000',
    fontSize: verticalScale(15),
    fontFamily: 'SpaceGroteskBold',
    letterSpacing: 0.2,
  },
});

import { memo, useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CURRENCY_PREFIX } from '../constants/currency';
import { EASE_OUT_EXPO, ENTRANCE_SPRING } from '../constants/motion';
import { PROGRESS_WINDOW_DAYS } from '../constants/reminder';
import { verticalScale } from '../constants/scaling';
import type { ReminderPillProps } from '../constants/types';
import AnimatedCounter from './AnimatedCounter';
import { CircularProgress } from './CircularProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PILL_WIDTH = verticalScale(170);
export const PILL_HEIGHT = verticalScale(50);
export const PILL_MARGIN = verticalScale(12);
export const PILL_START_X = SCREEN_WIDTH - PILL_WIDTH - PILL_MARGIN;
export const PILL_START_Y = PILL_MARGIN + verticalScale(40);

const PILL_AMOUNT_DURATION = 300;
const PILL_AMOUNT_DECIMALS = 0;

const ReminderPill = memo(function ReminderPill({
  data,
  onPress,
  translateX: externalX,
  translateY: externalY,
  draggable = true,
}: ReminderPillProps) {
  const fallbackX = useSharedValue(SCREEN_WIDTH);
  const fallbackY = useSharedValue(PILL_START_Y);
  const translateX = externalX ?? fallbackX;
  const translateY = externalY ?? fallbackY;

  const pillOpacity = useSharedValue(0);
  const pillScale = useSharedValue(0.7);
  const startX = useSharedValue(PILL_START_X);
  const startY = useSharedValue(PILL_START_Y);

  useEffect(() => {
    
    translateX.value = withSpring(PILL_START_X, ENTRANCE_SPRING);
    pillScale.value = withSpring(1, ENTRANCE_SPRING);
    pillOpacity.value = withTiming(1, { duration: 220, easing: EASE_OUT_EXPO });
  }, [pillOpacity, pillScale, translateX]);

  const { daysRemaining } = data;
  const fill = Math.min((daysRemaining / PROGRESS_WINDOW_DAYS) * 100, 100);

  const panGesture = Gesture.Pan()
    .enabled(draggable)
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const pillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: pillScale.value },
    ],
    opacity: pillOpacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.pill, pillStyle]}>
        <TouchableOpacity style={styles.pillInner} onPress={onPress} activeOpacity={0.85}>
          <Image source={data.contact.avatar} style={styles.pillAvatar} />
          <View style={styles.pillInfo}>
            <Text style={styles.pillHandle} numberOfLines={1}>
              {data.contact.handle}
            </Text>
            <AnimatedCounter
              value={parseFloat(data.amount)}
              decimals={PILL_AMOUNT_DECIMALS}
              duration={PILL_AMOUNT_DURATION}
              prefix={CURRENCY_PREFIX}
              style={styles.pillAmount}
            />
            <Text style={styles.pillDate} numberOfLines={1}>
              {data.dateLabel}
            </Text>
          </View>
          <CircularProgress
            size={verticalScale(42)}
            width={2.5}
            fill={fill}
            tintColor="#FFFFFF"
            backgroundColor="rgba(255,255,255,0.15)"
            rotation={0}
            lineCap="round"
            duration={800}
            style={styles.progressRing}
          >
            <View style={styles.pillCircleInner}>
              <Text style={styles.pillDaysNumber}>{daysRemaining}</Text>
              <Text style={styles.pillDaysLabel}>{daysRemaining === 1 ? 'day' : 'days'}</Text>
            </View>
          </CircularProgress>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
});

ReminderPill.displayName = 'ReminderPill';

export default ReminderPill;

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    width: PILL_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#161616',
    borderRadius: verticalScale(25),
    zIndex: 999,
  },
  pillInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: verticalScale(8),
  },
  pillAvatar: {
    width: verticalScale(40),
    height: verticalScale(40),
    marginLeft: verticalScale(8),
    borderRadius: verticalScale(22),
  },
  pillInfo: {
    flex: 1,
    gap: verticalScale(1),
  },
  pillHandle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: verticalScale(8),
    fontFamily: 'SpaceGroteskMedium',
  },
  pillAmount: {
    color: '#FFFFFF',
    fontSize: verticalScale(13),
    fontFamily: 'SpaceGroteskBold',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  pillDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: verticalScale(8),
    fontFamily: 'SpaceGroteskMedium',
  },
  progressRing: {
    marginRight: verticalScale(6),
  },
  pillCircleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDaysNumber: {
    color: '#FFFFFF',
    fontSize: verticalScale(11),
    fontFamily: 'SpaceGroteskBold',
    lineHeight: verticalScale(12),
  },
  pillDaysLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: verticalScale(7),
    fontFamily: 'SpaceGroteskMedium',
  },
});

import LottieView from 'lottie-react-native';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { clamp } from '../utils/math';
import TickSlider from './Tickslider';

import { verticalScale } from '../constants/styling';
import type { QuickPayCardProps, QuickPayStage } from '../constants/types';
import AvatarCarousel from './Avatarcarousel';
import SendStatusCard from './Sendstatuscard';

const DEFAULT_BACKGROUND_SOURCE = require('../assets/Lottie/nxwmOJC8PS.json');
const CARD_HEIGHT = 470;
const SPRING_CONFIG = { damping: 20, stiffness: 130, mass: 0.8 };
const PILL_TRANSITION = LinearTransition.springify().damping(18).stiffness(180);
const SEND_DURATION = 3500;
const CLOSE_DURATION = 300;
const FADE_IN_DURATION = 180;
const FADE_OUT_DURATION = 120;

const DEFAULT_MIN_AMOUNT = 100;
const DEFAULT_MAX_AMOUNT = 1800;
const DEFAULT_STEP = 100;

function SpinnerRing() {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(spin);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${spin.value}deg` }],
  }));

  return <Animated.View style={[styles.spinnerRing, ringStyle]} />;
}

interface ActionPillProps {
  readonly stage: QuickPayStage;
  readonly onConfirm: () => void;
  readonly onDone: () => void;
}

const ActionPill = memo(function ActionPill({ stage, onConfirm, onDone }: ActionPillProps) {
  return (
    <Animated.View style={styles.pill} layout={PILL_TRANSITION}>
      {stage === 'form' && (
        <TouchableOpacity style={styles.pillTouchable} activeOpacity={0.85} onPress={onConfirm}>
          <Animated.Text
            entering={FadeIn.duration(FADE_IN_DURATION)}
            exiting={FadeOut.duration(FADE_OUT_DURATION)}
            style={styles.pillText}
          >
            Confirm
          </Animated.Text>
        </TouchableOpacity>
      )}

      {stage === 'sending' && (
        <Animated.View
          entering={FadeIn.duration(FADE_IN_DURATION)}
          exiting={FadeOut.duration(FADE_OUT_DURATION)}
        >
          <SpinnerRing />
        </Animated.View>
      )}

      {stage === 'sent' && (
        <TouchableOpacity style={styles.pillTouchable} activeOpacity={0.85} onPress={onDone}>
          <Animated.Text
            entering={FadeIn.duration(FADE_IN_DURATION)}
            exiting={FadeOut.duration(FADE_OUT_DURATION)}
            style={styles.pillText}
          >
            Done
          </Animated.Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

function Backdrop({
  onClose,
  translateY,
}: {
  readonly onClose: () => void;
  readonly translateY: SharedValue<number>;
}) {
  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [0, CARD_HEIGHT], [1, 0], Extrapolation.CLAMP);
    return { opacity, pointerEvents: opacity > 0 ? 'auto' : 'none' };
  });

  return (
    <Animated.View style={[styles.backdrop, backdropStyle]}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
    </Animated.View>
  );
}

export default function QuickPayCard({
  visible,
  onClose,
  contacts,
  initialAmount = 1000,
  onConfirm,
  minAmount = DEFAULT_MIN_AMOUNT,
  maxAmount = DEFAULT_MAX_AMOUNT,
  step = DEFAULT_STEP,
  backgroundSource = DEFAULT_BACKGROUND_SOURCE,
  sendingIconSource,
  sentIconSource,
}: QuickPayCardProps) {
  const [amount, setAmount] = useState(() => clamp(initialAmount, minAmount, maxAmount));
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [stage, setStage] = useState<QuickPayStage>('form');
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useSharedValue(CARD_HEIGHT);
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.value = withSpring(0, SPRING_CONFIG);
      return;
    }

    translateY.value = withTiming(CARD_HEIGHT, { duration: CLOSE_DURATION }, (finished) => {
      if (finished) runOnJS(setIsMounted)(false);
    });
  }, [visible]);

  useEffect(() => {
    if (visible && stage !== 'form') {
      setStage('form');
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) clearTimeout(sendTimeoutRef.current);
    };
  }, []);

  const handleSend = useCallback(() => {
    setStage('sending');
    onConfirm?.(amount, activeContact);

    sendTimeoutRef.current = setTimeout(() => {
      setStage('sent');
      sendTimeoutRef.current = null;
    }, SEND_DURATION);
  }, [amount, activeContact, onConfirm]);

  const handleStatusConfirm = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .failOffsetX([-15, 15])
        .onUpdate((e) => {
          if (e.translationY > 0) translateY.value = e.translationY;
        })
        .onEnd((e) => {
          if (e.translationY > CARD_HEIGHT * 0.25 || e.velocityY > 800) {
            runOnJS(onClose)();
          } else {
            translateY.value = withSpring(0, SPRING_CONFIG);
          }
        }),
    [onClose]
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isMounted) return null;

  return (
    <>
      <Backdrop onClose={onClose} translateY={translateY} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <LottieView
            source={require('../assets/Lottie/nxwmOJC8PS.json')}
            autoPlay
            loop
            resizeMode="cover"
            style={styles.lottieBg}
          />

          <View style={styles.dragHandle} />

          <Animated.View
            style={[styles.contentArea, stage === 'form' ? styles.contentTop : styles.contentCenter]}
            layout={LinearTransition}
          >
            {stage === 'form' ? (
              <Animated.View
                key="form"
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(120)}
                style={styles.formBlock}
              >
                <Text style={styles.title}>Send Amount</Text>

                <AvatarCarousel contacts={contacts} onContactChange={setActiveContact} />

                <View style={styles.amountSection}>
                  <Text style={styles.amount}>${amount}</Text>
                </View>

                <TickSlider
                  value={amount}
                  onValueChange={setAmount}
                  min={minAmount}
                  max={maxAmount}
                  step={step}
                />
              </Animated.View>
            ) : (
              <Animated.View
                key="status"
                entering={FadeIn.duration(220).delay(80)}
                exiting={FadeOut.duration(120)}
              >
                <SendStatusCard stage={stage} />
              </Animated.View>
            )}
          </Animated.View>

          <ActionPill stage={stage} onConfirm={handleSend} onDone={handleStatusConfirm} />
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    backgroundColor: '#161616',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    zIndex: 20,
    gap: 14,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 6,
  },
  contentArea: { flex: 1 },

  contentTop: { justifyContent: 'flex-start' },

  contentCenter: { justifyContent: 'center',
     alignItems: 'center' },

  formBlock: { gap: 14 },

  title: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'SpaceGroteskSemiBold'
  },

  amountSection: {
    alignItems: 'center',
    gap: 2
  },

  amount: {
    color: '#fff',
    fontSize: 55,
    letterSpacing: 1.5,
    paddingTop: verticalScale(4),
    fontFamily: 'SpaceGroteskBold',
  },
  pill: {
    width: '100%',
    height: 56,
    borderRadius: 50,
    backgroundColor: '#212121',
    borderWidth: 0.5,
    borderColor: '#ffffff21',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pillTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },


  pillText: {
    color: '#ffffffc0',
    fontSize: 15,
    fontFamily: 'SpaceGroteskMedium'
  },

  spinnerRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderTopColor: 'rgba(255,255,255,0.75)',
  },
  lottieBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    pointerEvents: 'none',
  },
});
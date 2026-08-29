import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { FlipIconSource, SendStatusCardProps } from '../constants/types';

const ICON_SIZE = 190;
const SPIN_DURATION_MS = 2000;
const SPIN_CYCLES = 1000;
const CROSSFADE_DURATION = 350;
const SCALE_SPRING = { damping: 14, stiffness: 200, mass: 0.6 };

const DEFAULT_SENDING_ICON: FlipIconSource = {
  front: require('../assets/images/plan.png'),
  back: require('../assets/images/plan2.png'),
};

const DEFAULT_SENT_ICON: FlipIconSource = {
  front: require('../assets/images/checkmark.png'),
  back: require('../assets/images/checkmark2.png'),
};

function getFlipVisibility(rotateYDeg: number): boolean {
  'worklet';
  const normalized = ((rotateYDeg % 360) + 360) % 360;
  return normalized > 90 && normalized < 270;
}

export default function SendStatusCard({
  stage,
  sendingIconSource = DEFAULT_SENDING_ICON,
  sentIconSource = DEFAULT_SENT_ICON,
}: SendStatusCardProps) {
  const rotateY = useSharedValue(0);
  const planeOpacity = useSharedValue(1);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.8);

  useEffect(() => {
    rotateY.value = withTiming(-360 * SPIN_CYCLES, {
      duration: SPIN_DURATION_MS * SPIN_CYCLES,
      easing: Easing.linear,
    });
    return () => cancelAnimation(rotateY);
  }, []);

  useEffect(() => {
    if (stage !== 'sent') return;

    planeOpacity.value = withTiming(0, { duration: CROSSFADE_DURATION });
    checkOpacity.value = withTiming(1, { duration: CROSSFADE_DURATION });
    checkScale.value = withSpring(1, SCALE_SPRING);
  }, [stage]);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: getFlipVisibility(rotateY.value) ? 0 : 1,
    transform: [{ perspective: 900 }, { rotateY: `${rotateY.value}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: getFlipVisibility(rotateY.value) ? 1 : 0,
    transform: [{ perspective: 900 }, { rotateY: `${rotateY.value + 180}deg` }],
  }));

  const planeRigStyle = useAnimatedStyle(() => ({ opacity: planeOpacity.value }));
  const checkRigStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const isSending = stage === 'sending';

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Animated.View style={[styles.iconRig, planeRigStyle]} pointerEvents="none">
          <Animated.Image source={sendingIconSource.front} style={[styles.icon, frontStyle]} resizeMode="contain" />
          <Animated.Image source={sendingIconSource.back} style={[styles.icon, backStyle]} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.iconRig, styles.iconRigOverlay, checkRigStyle]} pointerEvents="none">
          <Animated.Image source={sentIconSource.front} style={[styles.icon, frontStyle]} resizeMode="contain" />
          <Animated.Image source={sentIconSource.back} style={[styles.icon, backStyle]} resizeMode="contain" />
        </Animated.View>
      </View>

      <Text style={styles.title}>{isSending ? 'Sending' : 'Sent'}</Text>
      <Text style={styles.subtitle}>
        {isSending ? 'This should take a moment' : 'You can close this now'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  iconWrapper: { width: ICON_SIZE, height: ICON_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  iconRig: { width: ICON_SIZE, height: ICON_SIZE, alignItems: 'center', justifyContent: 'center' },
  iconRigOverlay: { position: 'absolute', top: 0, left: 0 },
  icon: { position: 'absolute', width: ICON_SIZE, height: ICON_SIZE },
  title: { color: '#fff', fontSize: 38, fontFamily: 'SpaceGroteskSemiBold', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontFamily: 'SpaceGroteskMedium' },
});
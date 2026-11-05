import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import type { ComponentProps } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  CARD_H,
  CARD_W,
  DEG,
  PILL_GAP,
  PILL_H,
  PILL_W,
  STRAP_OVERLAP,
  TOTAL_H,
} from '../constants/card';
import { verticalScale } from '../constants/scaling';
import type { HangingCardProps } from '../constants/types';
import { useCardPhysics } from '../hooks/useCardPhysics';
import { Strap } from './Strap';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function HangingCard({
  name,
  role,
  phone,
  email,
  avatarSource,
  qrCodeSource,
  backLogoSource,
  frontGradientColors = ['#2A2330', '#FFFFFF'],
  backGradientColors = ['#2A2330', '#FFFFFF'],
  waveBackgroundSource = require('../assets/lottie/wave-bg.json'),
}: HangingCardProps) {
  const { gesture, pendulumStyle, cardFlipStyle, flipAngle } = useCardPhysics();

  const frontFaceStyle = useAnimatedStyle(() => ({
    opacity: Math.cos(flipAngle.value * DEG) >= 0 ? 1 : 0,
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    opacity: Math.cos(flipAngle.value * DEG) < 0 ? 1 : 0,
  }));

  return (
    <View style={styles.screen}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.pendulum, pendulumStyle]}>
          <Strap flipAngle={flipAngle} />
          <Animated.View style={[styles.card, cardFlipStyle]}>
            <AnimatedLinearGradient
              colors={frontGradientColors}
              start={{ x: 0, y: 1 }}
              end={{ x: 1.25, y: -0.25 }}
              style={[styles.face, frontFaceStyle]}
            >
              <LottieView
                source={waveBackgroundSource as ComponentProps<typeof LottieView>['source']}
                autoPlay
                loop
                resizeMode="cover"
                style={styles.wave}
              />
              <View style={styles.pill} />
              <Text style={styles.role}>{role}</Text>
              <Text style={styles.name}>{name}</Text>
              {qrCodeSource ? <Image source={qrCodeSource} style={styles.qr} /> : null}
              {phone ? <Text style={styles.contactPhone}>{phone}</Text> : null}
              {email ? <Text style={styles.contactEmail}>{email}</Text> : null}
              <Image source={avatarSource} style={styles.avatar} />
            </AnimatedLinearGradient>
            <AnimatedLinearGradient
              colors={backGradientColors}
              start={{ x: 0, y: 1 }}
              end={{ x: 1.25, y: -0.25 }}
              style={[styles.face, styles.back, backFaceStyle]}
            >
              <View style={styles.pill} />
              {backLogoSource ? (
                <Image source={backLogoSource} style={styles.backLogo} resizeMode="contain" />
              ) : null}
            </AnimatedLinearGradient>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendulum: {
    alignItems: 'center',
    height: TOTAL_H,
    overflow: 'visible',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: verticalScale(30),
    boxShadow: '0 16px 32px rgba(0,0,0,0.35)',
  },
  face: {
    ...StyleSheet.absoluteFill,
    borderRadius: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wave: {
    ...StyleSheet.absoluteFill,
    width: undefined,
    height: undefined,
    opacity: 0.1,
  },
  back: {
    transform: [{ rotateY: '180deg' }],
  },
  pill: {
    position: 'absolute',
    top: STRAP_OVERLAP + PILL_GAP,
    left: '50%',
    marginLeft: -PILL_W / 2,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
    backgroundColor: '#fff',
  },
  avatar: {
    position: 'absolute',
    right: verticalScale(16),
    bottom: verticalScale(16),
    width: verticalScale(90),
    height: verticalScale(90),
    borderRadius: verticalScale(50),
  },
  qr: {
    position: 'absolute',
    left: verticalScale(24),
    bottom: verticalScale(60),
    width: verticalScale(90),
    height: verticalScale(90),
    borderRadius: verticalScale(12),
  },
  contactPhone: {
    position: 'absolute',
    left: verticalScale(20),
    bottom: verticalScale(28),
    fontFamily: 'SpaceGroteskMedium',
    fontSize: verticalScale(12),
    color: '#fff',
  },
  contactEmail: {
    position: 'absolute',
    left: verticalScale(20),
    bottom: verticalScale(12),
    fontFamily: 'SpaceGroteskMedium',
    fontSize: verticalScale(12),
    color: '#fff',
  },
  name: {
    position: 'absolute',
    right: verticalScale(16),
    bottom: verticalScale(122),
    fontFamily: 'SpaceGroteskSemiBold',
    fontSize: verticalScale(20),
    color: '#fff',
    textAlign: 'right',
  },
  role: {
    position: 'absolute',
    right: verticalScale(16),
    bottom: verticalScale(149),
    fontFamily: 'SpaceGroteskMedium',
    fontSize: verticalScale(12),
    color: '#fff',
    textAlign: 'right',
  },
  backLogo: {
    width: verticalScale(140),
    height: verticalScale(56),
    opacity: 0.5,
  },
});

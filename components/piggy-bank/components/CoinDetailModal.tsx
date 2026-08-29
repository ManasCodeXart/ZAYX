import AnimatedCounter from '@/components/AnimatedCounter';
import { ArrowLeft } from 'phosphor-react-native';
import { verticalScale } from '../constants/scaling';

import { useState } from 'react';
import {
  Dimensions,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const [shortDimension] =
  SCREEN_WIDTH < SCREEN_HEIGHT
    ? [SCREEN_WIDTH, SCREEN_HEIGHT]
    : [SCREEN_HEIGHT, SCREEN_WIDTH];

const guidelineBaseWidth = 375;

const scale = (size: number) =>
  Math.round(
    PixelRatio.roundToNearestPixel((shortDimension / guidelineBaseWidth) * size)
  );

const SPRING_CONFIG = { damping: 18, stiffness: 130, mass: 0.8 };

type Coin = {
  name: string;
  price: number;
  image: any;
};

type CoinDetailModalRef = {
  open: (ref: any, coin: Coin) => void;
};

export const useCoinDetailModal = () => {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [coinStartX, setCoinStartX] = useState(0);
  const [coinStartY, setCoinStartY] = useState(0);

  const overlayOpacity = useSharedValue(0);
  const coinScale = useSharedValue(1);
  const coinTranslateX = useSharedValue(0);
  const coinTranslateY = useSharedValue(0);
  const detailOpacity = useSharedValue(0);

  const handleCoinPress = (ref: any, coin: Coin & { id: string }) => {
    ref.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      const targetX = SCREEN_WIDTH / 2;
      const targetY = SCREEN_HEIGHT * 0.22;

      coinTranslateX.value = 0;
      coinTranslateY.value = 0;
      coinScale.value = 1;
      overlayOpacity.value = 0;
      detailOpacity.value = 0;

      setCoinStartX(pageX + width / 2 - verticalScale(40));
      setCoinStartY(pageY + height / 2 - verticalScale(40));
      setSelectedCoin(coin);

      setTimeout(() => {
        overlayOpacity.value = withTiming(1, { duration: 200 });
        coinTranslateX.value = withSpring(targetX - (pageX + width / 2), SPRING_CONFIG);
        coinTranslateY.value = withSpring(targetY - (pageY + height / 2), SPRING_CONFIG);
        coinScale.value = withSpring(2.8, { damping: 14, stiffness: 180, mass: 0.7 });
        detailOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
      }, 50);
    });
  };

  const handleClose = () => {
    overlayOpacity.value = withTiming(0, { duration: 400 });
    detailOpacity.value = withTiming(0, { duration: 200 });
    coinScale.value = withSpring(1, SPRING_CONFIG);
    coinTranslateX.value = withSpring(0, SPRING_CONFIG);
    coinTranslateY.value = withSpring(0, SPRING_CONFIG);
    setTimeout(() => setSelectedCoin(null), 400);
  };

  return {
    selectedCoin,
    coinStartX,
    coinStartY,
    overlayOpacity,
    coinScale,
    coinTranslateX,
    coinTranslateY,
    detailOpacity,
    handleCoinPress,
    handleClose,
  };
};

type Props = {
  selectedCoin: Coin | null;
  coinStartX: number;
  coinStartY: number;
  overlayOpacity: any;
  coinScale: any;
  coinTranslateX: any;
  coinTranslateY: any;
  detailOpacity: any;
  onClose: () => void;
};

const CoinDetailModal = ({
  selectedCoin,
  coinStartX,
  coinStartY,
  overlayOpacity,
  coinScale,
  coinTranslateX,
  coinTranslateY,
  detailOpacity,
  onClose,
}: Props) => {
  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const floatingCoinStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: coinTranslateX.value },
      { translateY: coinTranslateY.value },
      { scale: coinScale.value },
    ],
  }));

  const detailContentStyle = useAnimatedStyle(() => ({
    opacity: detailOpacity.value,
  }));

  if (!selectedCoin) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayAnimStyle]}>

      {/* Floating coin */}
      <Animated.Image
        source={selectedCoin.image}
        style={[styles.floatingCoin, floatingCoinStyle, {
          left: coinStartX,
          top: coinStartY,
        }]}
        resizeMode="contain"
      />

      {/* Detail content */}
      <Animated.View style={[StyleSheet.absoluteFill, detailContentStyle]}>

        <TouchableOpacity style={styles.detailBackBtn} onPress={onClose}>
          <ArrowLeft size={scale(20)} color="#ffffff" weight="bold" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.detailScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: verticalScale(220) }} />

          <Text style={styles.detailName}>{selectedCoin.name}</Text>

          <AnimatedCounter
            value={selectedCoin.price}
            prefix="$"
            decimals={selectedCoin.price < 1 ? 3 : 2}
            duration={600}
            style={styles.detailPrice}
          />

          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Overview</Text>
            <Text style={styles.detailCardBody}>
              {selectedCoin.name} is a leading cryptocurrency asset traded globally across major exchanges with high liquidity and market activity.
            </Text>

            <Text style={styles.detailCardTitle}>Key Highlights</Text>
            {[
              'Fast-growing blockchain infrastructure',
              'Supports decentralized finance',
              'Large and active developer community',
              'Billions in on-chain activity daily',
            ].map((point, index) => (
              <View key={index} style={styles.detailBulletRow}>
                <Text style={styles.detailBullet}>•</Text>
                <Text style={styles.detailBulletText}>{point}</Text>
              </View>
            ))}
          </View>

        </ScrollView>

        <TouchableOpacity style={styles.detailBuyBtn}>
          <Text style={styles.detailBuyText}>Buy {selectedCoin.name}</Text>
        </TouchableOpacity>

      </Animated.View>

    </Animated.View>
  );
};

export default CoinDetailModal;

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: '#000000',
    zIndex: 100,
  },
  floatingCoin: {
    position: 'absolute',
    width: verticalScale(70),
    height: verticalScale(70),
    zIndex: 101,
  },
  detailBackBtn: {
    position: 'absolute',
    top: verticalScale(52),
    left: scale(20),
    zIndex: 102,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailScroll: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(120),
  },
  detailName: {
    color: '#ffffff',
    fontSize: scale(22),
    fontWeight: '500',
    marginTop: verticalScale(80),
    letterSpacing: 2,
  },
  detailPrice: {
    color: '#ffffff',
    fontSize: scale(36),
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  detailCard: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: verticalScale(20),
    padding: verticalScale(20),
    marginTop: verticalScale(28),
    gap: verticalScale(12),
  },
  detailCardTitle: {
    color: '#ffffff',
    fontSize: scale(14),
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  detailCardBody: {
    color: '#888888',
    fontSize: scale(12),
    textAlign: 'center',
    lineHeight: verticalScale(20),
  },
  detailBulletRow: {
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'flex-start',
  },
  detailBullet: {
    color: '#888888',
    fontSize: scale(12),
  },
  detailBulletText: {
    color: '#888888',
    fontSize: scale(12),
    flex: 1,
  },
  detailBuyBtn: {
    position: 'absolute',
    bottom: verticalScale(32),
    alignSelf: 'center',
    width: '88%',
    backgroundColor: '#ffffff',
    borderRadius: scale(999),
    paddingVertical: verticalScale(18),
    alignItems: 'center',
  },
  detailBuyText: {
    color: '#000000',
    fontSize: scale(16),
    fontWeight: '600',
  },
});
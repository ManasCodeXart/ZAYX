import { memo, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { scale, verticalScale } from '../constants/scaling';
import type { Coin, CoinMorphAnimation, CoinOrigin } from '../constants/types';
import { FLOATING_COIN_SIZE } from '../hooks/useCoinDetailModal';

const Z_INDEX = { overlay: 100, floatingCoin: 101, detailContent: 102 } as const;
const BACK_BUTTON_HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 };

export interface CoinDetailModalProps {
  readonly selectedCoin: Coin | null;
  readonly coinOrigin: CoinOrigin;
  readonly animation: CoinMorphAnimation;
  readonly onClose: () => void;
  readonly overlayColor?: string;
  readonly children?: ReactNode;
}

const CoinDetailModal = memo(
  ({ selectedCoin, coinOrigin, animation, onClose, overlayColor = colors.background, children }: CoinDetailModalProps) => {
    const { overlayOpacity, coinScale, coinTranslateX, coinTranslateY, coinSquashY, detailOpacity } = animation;

    const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));

    const floatingCoinStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: coinTranslateX.value },
        { translateY: coinTranslateY.value },
        { scaleX: coinScale.value },
        { scaleY: coinScale.value * coinSquashY.value },
      ],
    }));

    const detailContentStyle = useAnimatedStyle(() => ({ opacity: detailOpacity.value }));

    if (!selectedCoin) return null;

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: overlayColor }, overlayStyle]}
      >
        <Animated.Image
          source={selectedCoin.image}
          style={[styles.floatingCoin, floatingCoinStyle, { left: coinOrigin.x, top: coinOrigin.y }]}
          resizeMode="contain"
        />

        <Animated.View style={[StyleSheet.absoluteFill, detailContentStyle]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={BACK_BUTTON_HIT_SLOP}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {children}
        </Animated.View>
      </Animated.View>
    );
  }
);

CoinDetailModal.displayName = 'CoinDetailModal';

export default CoinDetailModal;

const styles = StyleSheet.create({
  overlay: {
    zIndex: Z_INDEX.overlay,
  },
  floatingCoin: {
    position: 'absolute',
    width: FLOATING_COIN_SIZE,
    height: FLOATING_COIN_SIZE,
    zIndex: Z_INDEX.floatingCoin,
  },
  backButton: {
    position: 'absolute',
    top: verticalScale(52),
    left: scale(20),
    zIndex: Z_INDEX.detailContent,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },


  backArrow: {
   fontSize: scale(20),
    fontWeight: '600',
   color: colors.textPrimary,
  },
  
});
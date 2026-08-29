import { memo, useCallback, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { verticalScale } from '../constants/scaling';
import type { Coin, CoinImageRef } from '../constants/types';
import AnimatedCounter from './AnimatedCounter';

const COUNTER_ANIMATION_DURATION = 500;
const LOW_PRICE_DECIMALS_THRESHOLD = 1;

export interface CoinListItemProps {
  readonly coin: Coin;
  readonly onPress: (imageRef: CoinImageRef, coin: Coin) => void;
}

const CoinListItem = memo(({ coin, onPress }: CoinListItemProps) => {
  const imageRef = useRef<Image>(null);
  const handlePress = useCallback(() => onPress(imageRef, coin), [onPress, coin]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${coin.name}`}
      >
        <Image ref={imageRef} source={coin.image} style={styles.coinImage} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name}>{coin.name}</Text>
        <View style={styles.priceRow}>
          <AnimatedCounter
            value={coin.price}
            prefix="$"
            decimals={coin.price < LOW_PRICE_DECIMALS_THRESHOLD ? 3 : 2}
            duration={COUNTER_ANIMATION_DURATION}
            style={styles.priceText}
          />
        </View>
      </View>
    </View>
  );
});

CoinListItem.displayName = 'CoinListItem';

export default CoinListItem;

const styles = StyleSheet.create({
  card: {
    width: verticalScale(130),
    height: verticalScale(130),
    backgroundColor: colors.surface,
    borderRadius: verticalScale(18),
    padding: verticalScale(6),
    justifyContent: 'space-between',
  },
  coinImage: {
    width: verticalScale(80),
    height: verticalScale(80),
    alignSelf: 'center',
  },
  info: {
    gap: verticalScale(1),
  },
  name: {
    color: colors.textMuted,
    fontSize: verticalScale(11),
    alignSelf: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceText: {
    color: colors.textPrimary,
    fontSize: verticalScale(12),
    fontWeight: '600',
  },
});
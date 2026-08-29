import { memo, useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItem } from 'react-native';
import { verticalScale } from '../constants/scaling';
import type { Coin, CoinImageRef } from '../constants/types';
import CoinListItem from './CoinListItem';

const keyExtractor = (coin: Coin) => coin.id;

export interface CoinListProps {
  readonly coins: readonly Coin[];
  readonly onCoinPress: (imageRef: CoinImageRef, coin: Coin) => void;
}

const CoinList = memo(({ coins, onCoinPress }: CoinListProps) => {
  const renderItem = useCallback<ListRenderItem<Coin>>(
    ({ item }) => <CoinListItem coin={item} onPress={onCoinPress} />,
    [onCoinPress]
  );

  return (
    <FlatList
      data={coins}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      renderItem={renderItem}
    />
  );
});

CoinList.displayName = 'CoinList';

export default CoinList;

const styles = StyleSheet.create({
  list: {
    gap: verticalScale(10),
    paddingHorizontal: verticalScale(4),
  },
});
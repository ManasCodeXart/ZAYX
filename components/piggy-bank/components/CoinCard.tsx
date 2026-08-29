import { useRef } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { verticalScale } from '../constants/scaling';
import AnimatedCounter from './AnimatedCounter';

const COINS = [
  { id: '1', name: 'Bitcoin', price: 81006.25, image: require('../assets/images/btc.png') },
  { id: '2', name: 'Ethereum', price: 2302.08, image: require('../assets/images/eth.png') },
  { id: '3', name: 'BNB', price: 676.75, image: require('../assets/images/bnb.png') },
  { id: '4', name: 'Solana', price: 95.14, image: require('../assets/images/solana.png') },
  { id: '5', name: 'USDC', price: 0.997, image: require('../assets/images/usdc.png') },
  { id: '6', name: 'Tether', price: 1.56, image: require('../assets/images/usdt.png') },
  { id: '7', name: 'Cardano', price: 0.28, image: require('../assets/images/cnc.png') },
  { id: '8', name: 'Dogecoin', price: 0.11, image: require('../assets/images/dog.png') },
];

export type Coin = typeof COINS[0];

interface CardProps {
  id: string;
  name: string;
  price: number;
  image: any;
  onCoinPress: (ref: any, coin: Coin) => void;
}

const Card = ({ id, name, price, image, onCoinPress }: CardProps) => {
  const imageRef = useRef<Image>(null);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => onCoinPress(imageRef, { id, name, price, image })}>
        <Image ref={imageRef} source={image} style={styles.coinImage} resizeMode="contain" />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.priceRow}>
          <AnimatedCounter
            value={price}
            prefix="$"
            decimals={price < 1 ? 3 : 2}
            duration={500}
            style={styles.priceText}
          />
        </View>
      </View>
    </View>
  );
};

const CoinCard = ({ onCoinPress }: { onCoinPress: (ref: any, coin: Coin) => void }) => {
  return (
    <FlatList
      data={COINS}
      horizontal
      nestedScrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card
          id={item.id}
          name={item.name}
          price={item.price}
          image={item.image}
          onCoinPress={onCoinPress}
        />
      )}
    />
  );
};

export default CoinCard;

const styles = StyleSheet.create({
  list: {
    gap: verticalScale(10),
    paddingHorizontal: verticalScale(4),
  },
  card: {
    width: verticalScale(130),
    height: verticalScale(130),
    backgroundColor: '#111111',
    borderRadius: verticalScale(22),
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
    color: '#888888',
    fontSize: verticalScale(11),
    alignSelf: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: verticalScale(12),
    fontWeight: '600',
  },
});
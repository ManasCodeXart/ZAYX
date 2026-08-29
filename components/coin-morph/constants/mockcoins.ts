import type { Coin } from '../constants/types';

// Demo data for the example screen only. users of CoinList should pass
// their own `coins` prop — this file is not part of the component's public API.
export const MOCK_COINS: readonly Coin[] = [
  { id: '1', name: 'Bitcoin', price: 81006.25, image: require('../assets/images/btc.png') },
  { id: '2', name: 'Ethereum', price: 2302.08, image: require('../assets/images/eth.png') },
  { id: '3', name: 'BNB', price: 676.75, image: require('../assets/images/bnb.png') },
  { id: '4', name: 'Solana', price: 95.14, image: require('../assets/images/solana.png') },
  { id: '5', name: 'USDC', price: 0.997, image: require('../assets/images/usdc.png') },
  { id: '6', name: 'Tether', price: 1.56, image: require('../assets/images/usdt.png') },
  { id: '7', name: 'Cardano', price: 0.28, image: require('../assets/images/ada.png') },
  { id: '8', name: 'Dogecoin', price: 0.11, image: require('../assets/images/dog.png') },
];
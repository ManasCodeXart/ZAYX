import { verticalScale } from '../../utils/scaling'
import type { Coin, CoinPosition } from '../constants/types'

const toArcPosition = (x: number, y: number): CoinPosition => ({
  x: verticalScale(x),
  y: verticalScale(y),
})

export const DEFAULT_COINS: readonly Coin[] = [
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    glowColor: '#9945FF',
    icon: require('../../assets/CoinImages/solana.png'),
    position: toArcPosition(-165, -150),
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    glowColor: '#F7931A',
    icon: require('../../assets/CoinImages/btc.png'),
    position: toArcPosition(-35, -250),
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    glowColor: '#627EEA',
    icon: require('../../assets/CoinImages/eth.png'),
    position: toArcPosition(45, -215),
  },
  {
    id: 'ada',
    name: 'Cardano',
    symbol: 'ADA',
    glowColor: '#0033AD',
    icon: require('../../assets/CoinImages/ada.png'),
    position: toArcPosition(95, -150),
  },
  {
    id: 'bnb',
    name: 'BNB',
    symbol: 'BNB',
    glowColor: '#F3BA2F',
    icon: require('../../assets/CoinImages/bnb.png'),
    position: toArcPosition(-115, -215),
  },
]
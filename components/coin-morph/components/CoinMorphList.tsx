import type { ReactNode } from 'react';
import CoinDetailModal from '../components/CoinDetailModal';
import type { Coin } from '../constants/types';
import { useCoinDetailModal } from '../hooks/useCoinDetailModal';
import CoinList from './CoinList';

export interface CoinMorphListProps {
  readonly coins: readonly Coin[];
  readonly renderDetail?: (coin: Coin) => ReactNode;
  readonly overlayColor?: string;
}

const CoinMorphList = ({ coins, renderDetail, overlayColor }: CoinMorphListProps) => {
  const { selectedCoin, coinOrigin, animation, openCoinDetail, closeCoinDetail } = useCoinDetailModal();

  return (
    <>
      <CoinList coins={coins} onCoinPress={openCoinDetail} />
      <CoinDetailModal
        selectedCoin={selectedCoin}
        coinOrigin={coinOrigin}
        animation={animation}
        onClose={closeCoinDetail}
        overlayColor={overlayColor}
      >
        {selectedCoin && renderDetail?.(selectedCoin)}
      </CoinDetailModal>
    </>
  );
};

export default CoinMorphList;
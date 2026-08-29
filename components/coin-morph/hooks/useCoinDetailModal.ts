import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
    runOnJS,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { verticalScale } from '../constants/scaling';
import type { Coin, CoinImageRef, CoinMorphAnimation, CoinOrigin } from '../constants/types';


const TARGET_Y_RATIO = 0.22;


const OPEN_COIN_SCALE = 2.8;


export const FLOATING_COIN_SIZE = verticalScale(70);


const FLOATING_COIN_HALF_SIZE = verticalScale(40);

const SETTLE_SPRING_CONFIG = { damping: 18, stiffness: 130, mass: 0.8 } as const;
const BOUNCE_SPRING_CONFIG = { damping: 14, stiffness: 180, mass: 0.7 } as const;
const CLOSE_SPRING_CONFIG = { damping: 26, stiffness: 160, mass: 0.9 } as const;
const CLOSE_SQUASH_CONFIG = { damping: 14, stiffness: 260, mass: 0.6 } as const;

const SQUASH_MIN_SCALE_Y = 0.82;
const SQUASH_DIP_DURATION = 70;

const OVERLAY_FADE_IN_DURATION = 200;
const OVERLAY_FADE_OUT_DURATION = 400;
const DETAIL_FADE_OUT_DURATION = 200;
const DETAIL_REVEAL_DELAY = 250;
const DETAIL_REVEAL_DURATION = 500;

export interface UseCoinDetailModalReturn {
  readonly selectedCoin: Coin | null;
  readonly coinOrigin: CoinOrigin;
  readonly animation: CoinMorphAnimation;
  readonly openCoinDetail: (imageRef: CoinImageRef, coin: Coin) => void;
  readonly closeCoinDetail: () => void;
}

export function useCoinDetailModal(): UseCoinDetailModalReturn {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [coinOrigin, setCoinOrigin] = useState<CoinOrigin>({ x: 0, y: 0 });


  const isTransitioningRef = useRef(false);

  const overlayOpacity = useSharedValue(0);
  const coinScale = useSharedValue(1);
  const coinTranslateX = useSharedValue(0);
  const coinTranslateY = useSharedValue(0);
  const coinSquashY = useSharedValue(1);
  const detailOpacity = useSharedValue(0);

  const openCoinDetail = useCallback(
    (imageRef: CoinImageRef, coin: Coin) => {
      if (isTransitioningRef.current) return;

      const node = imageRef.current;
      if (!node) return;

      isTransitioningRef.current = true;

      node.measure((_x, _y, width, height, pageX, pageY) => {
        coinTranslateX.value = 0;
        coinTranslateY.value = 0;
        coinScale.value = 1;
        coinSquashY.value = 1;
        overlayOpacity.value = 0;
        detailOpacity.value = 0;

        setCoinOrigin({
          x: pageX + width / 2 - FLOATING_COIN_HALF_SIZE,
          y: pageY + height / 2 - FLOATING_COIN_HALF_SIZE,
        });
        setSelectedCoin(coin);
      });
    },
    [coinScale, coinSquashY, coinTranslateX, coinTranslateY, detailOpacity, overlayOpacity]
  );

  useEffect(() => {
    if (!selectedCoin) return;

  
    const targetX = screenWidth / 2 - (coinOrigin.x + FLOATING_COIN_HALF_SIZE);
    const targetY = screenHeight * TARGET_Y_RATIO - (coinOrigin.y + FLOATING_COIN_HALF_SIZE);

    overlayOpacity.value = withTiming(1, { duration: OVERLAY_FADE_IN_DURATION });
    coinTranslateX.value = withSpring(targetX, SETTLE_SPRING_CONFIG);
    coinTranslateY.value = withSpring(targetY, SETTLE_SPRING_CONFIG);
    coinScale.value = withSpring(OPEN_COIN_SCALE, BOUNCE_SPRING_CONFIG);
    detailOpacity.value = withDelay(
      DETAIL_REVEAL_DELAY,
      withTiming(1, { duration: DETAIL_REVEAL_DURATION })
    );
  }, [
    selectedCoin,
    coinOrigin,
    screenWidth,
    screenHeight,
    overlayOpacity,
    coinScale,
    coinTranslateX,
    coinTranslateY,
    detailOpacity,
  ]);

  const finishClose = useCallback(() => {
    setSelectedCoin(null);
    isTransitioningRef.current = false;
  }, []);

  const closeCoinDetail = useCallback(() => {
    if (!selectedCoin) return;

    detailOpacity.value = withTiming(0, { duration: DETAIL_FADE_OUT_DURATION });
    coinScale.value = withSpring(1, CLOSE_SPRING_CONFIG);
    coinTranslateX.value = withSpring(0, CLOSE_SPRING_CONFIG);
    coinTranslateY.value = withSpring(0, CLOSE_SPRING_CONFIG, (finished) => {
      if (finished) {
        coinSquashY.value = withSequence(
          withTiming(SQUASH_MIN_SCALE_Y, { duration: SQUASH_DIP_DURATION }),
          withSpring(1, CLOSE_SQUASH_CONFIG)
        );
      }
    });
    overlayOpacity.value = withTiming(0, { duration: OVERLAY_FADE_OUT_DURATION }, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [selectedCoin, detailOpacity, coinScale, coinTranslateX, coinTranslateY, coinSquashY, overlayOpacity, finishClose]);

  const animation = useMemo<CoinMorphAnimation>(
    () => ({ overlayOpacity, coinScale, coinTranslateX, coinTranslateY, coinSquashY, detailOpacity }),
    [overlayOpacity, coinScale, coinTranslateX, coinTranslateY, coinSquashY, detailOpacity]
  );

  return { selectedCoin, coinOrigin, animation, openCoinDetail, closeCoinDetail };
}
import { verticalScale } from './scaling';
import type { IslandState } from './types';

const VARIANT_CONFIG = {
  send: {
    lottieSource: require('../assets/lottie/sent.json'),
    lottieStyle: { width: verticalScale(35), height: verticalScale(35) },
    lottieDuration: 2500,
    pillLabel: (state: IslandState, amount?: string) =>
      state === 'success' ? 'Sent' : amount ?? 'Sending...',
    autoResolves: false,
    collapseToCompact: true,
  },

  cardAdded: {
    lottieSource: require('../assets/lottie/Cardadd.json'),
    lottieStyle: { width: verticalScale(52), height: verticalScale(52) },
    lottieDuration: 3400,
    pillLabel: () => 'Card added!',
    autoResolves: true,
    collapseToCompact: false,
  },

  savings: {
    lottieSource: require('../assets/lottie/Savings.json'),
    lottieStyle: { width: verticalScale(48), height: verticalScale(48) },
    lottieDuration: 3400,
    pillLabel: () => 'Yay savings!',
    autoResolves: true,
    collapseToCompact: false,
  },
} as const

export type IslandVariant = keyof typeof VARIANT_CONFIG

export { VARIANT_CONFIG };

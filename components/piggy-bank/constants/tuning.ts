import { Dimensions } from 'react-native'
import { verticalScale } from './scaling'
import type { QuickAmountPill } from './types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')


export const PIGGY_SIZE = SCREEN_WIDTH * 0.78


export const PIGGY_HEIGHT = verticalScale(210)


export const SLOT_OFFSET_RATIO = 0.04


export const SLOT_CENTER_X = SCREEN_WIDTH / 2


export const getCoinCount = (amount: number): number => {
  if (amount <= 0) return 0
  if (amount < 25) return 1
  if (amount < 50) return 3
  if (amount < 100) return 4
  return 5
}


export const MAX_COIN_SPREAD = verticalScale(400)


export const COIN_SPAWN_Y = -verticalScale(80)


export const COIN_SIZE = verticalScale(50)

// ─── Timing ─────────────────────────────────────────────────────────────────


export const COIN_STAGGER_DELAY = 300


export const COIN_FALL_DURATION = 1700


export const COIN_ABSORB_DURATION = 100


export const SAVE_CONFIRMATION_TIMEOUT = 3000


export const JIGGLE_DEGREES = 3


export const JIGGLE_DURATION = 80


export const DEFAULT_QUICK_AMOUNTS: readonly QuickAmountPill[] = [
  { label: '$100', value: 100 },
  { label: '$500', value: 500 },
  { label: '$1000', value: 1000 },
]
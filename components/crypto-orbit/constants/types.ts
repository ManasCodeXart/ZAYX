import type { ImageSourcePropType } from 'react-native'
import type { GestureType } from 'react-native-gesture-handler'
import type { SharedValue } from 'react-native-reanimated'

export interface CoinPosition {
  readonly x: number
  readonly y: number
}

export interface Coin {
  readonly id: string
  readonly name: string
  readonly symbol: string
  readonly glowColor: string
  readonly icon: ImageSourcePropType
  readonly position: CoinPosition
}

export type RevealProgress = SharedValue<number[]>

export interface UseCoinGestureParams {
  readonly coins: readonly Coin[]
  readonly hitRadius?: number
  readonly hapticsEnabled?: boolean
  readonly onSelect: (coin: Coin) => void
  readonly onActiveChange?: (isActive: boolean) => void
}

export interface UseCoinGestureResult {
  readonly gesture: GestureType
  readonly activeIndex: SharedValue<number>
  readonly backdropOpacity: SharedValue<number>
  readonly activeCoinId: string | null
  readonly revealProgress: RevealProgress
  readonly buttonLayout: SharedValue<CoinPosition>
}
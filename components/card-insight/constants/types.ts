import type { useRipple } from '../hooks/ripple'
import type React from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'


export type CardSwipeDirection = 'next' | 'prev'


export type CardFace = 'front' | 'back'

export interface UseCardFlipGestureParams {
  readonly enabled: boolean
  readonly onSwipePage: (direction: CardSwipeDirection) => void
  readonly onSettle: () => void
}



export interface SpendingTrend {
  
  readonly percentChange: number
  readonly isIncrease: boolean
  
  readonly hasComparison: boolean
}



export type CardFieldAlign = 'left' | 'right'



export interface CardData {
  readonly id: string
  
  readonly lastFourDigits: string
  readonly holderName: string
  readonly expiry: string
  readonly balance: number
  readonly cvv: string
  readonly spentThisWeek: number
  readonly previousWeekSpend: number
  readonly dueBills: number
  readonly subscriptions: number
}

export interface Card3DProps {
  readonly card: CardData
  readonly isActive: boolean
  readonly onSwipePage: (direction: CardSwipeDirection) => void
}

export interface CardFrontProps {
  readonly lastFourDigits: string
  readonly holderName: string
  readonly expiry: string
  readonly balance: number
  readonly visible: boolean
}

export interface CardBackProps {
  readonly holderName: string
  readonly cvv: string
  readonly spentThisWeek: number
  readonly previousWeekSpend: number
  readonly dueBills: number
  readonly subscriptions: number
  readonly visible: boolean
}



interface CardInfoFieldBaseProps {
  readonly label: string
  readonly align?: CardFieldAlign
  readonly labelStyle?: TextStyle
}


export type CardInfoFieldProps = CardInfoFieldBaseProps &
  (
    | { readonly value: string; readonly valueStyle?: TextStyle; readonly valueNode?: never }
    | { readonly value?: never; readonly valueStyle?: never; readonly valueNode: React.ReactNode }
  )

type RippleHookReturn = ReturnType<typeof useRipple>
export interface RippleOverlayProps {
  width: number
  height: number
  color: string
  readonly uniforms: RippleHookReturn['uniforms']
  readonly intensity: RippleHookReturn['intensity']
  readonly borderRadius?: number
  readonly style?: StyleProp<ViewStyle>
}

export interface UseRippleParams {
  amplitude: number
  frequency: number
  speed: number
  decay: number
  duration: number
  width: number
  height: number
}

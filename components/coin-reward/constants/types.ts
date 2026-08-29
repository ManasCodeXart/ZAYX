import type { SkPathBuilder } from '@shopify/react-native-skia'
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'



export type CoinFace = 'heads' | 'tails'

export interface CoinProps {
    
    readonly face: CoinFace
    readonly source?: ImageSourcePropType
    readonly style?: StyleProp<ViewStyle>
}



export interface CoinFlipProps {
    readonly onResult?: (face: CoinFace) => void
}



export interface ScratchCardProps {
    readonly face: CoinFace | null
    readonly visible: boolean
    readonly onDismiss?: () => void
    readonly onFullyRevealed?: () => void
}

export interface ScratchPoint {
    readonly x: number
    readonly y: number
}


export interface ScratchStroke {
    readonly builder: SkPathBuilder
    lastPoint: ScratchPoint | null
}



export interface RevealContentProps {
    readonly face: CoinFace
}



export interface FlipRevealProps {
    readonly onFlipComplete?: (face: CoinFace) => void
    readonly onRevealComplete?: (face: CoinFace) => void
}








/** A single falling coin instance */
export interface GravityCoinProps {
  /** Unique key for this coin in the drop sequence */
  id: string;
  /** Horizontal landing target — X center of the piggy bank slot (pixels) */
  slotX: number;
  /** Vertical landing target — Y center of the piggy bank slot (pixels) */
  slotY: number;
  /** Small random X offset so coins don't stack in a perfect line */
  offsetX: number;
  /** Delay in ms before this coin starts falling */
  delay: number;
  /** Called when the coin reaches the slot and disappears */
  onLanded: (id: string) => void;
}

/** Ref handle exposed by PiggyBank so parent can trigger jiggle imperatively */
export type PiggyBankRef = {
  jiggle: () => void
  proudPuff: () => void
}
/** Props for the PiggyBank component */
export interface PiggyBankProps {
  /** Image source for the piggy bank PNG */
  source: any; // ImageSourcePropType
  /** Width of the rendered piggy bank image */
  size: number;
  /** Called with the absolute slot position once the layout is measured */
  onSlotMeasured: (slotX: number, slotY: number) => void;
}

/** Quick-amount preset pill */
export interface QuickAmountPill {
  label: string;  // display text e.g. "$100"
  value: string;  // raw numeric string e.g. "100"
}

/** Props for the full GravitySavings component */
export interface GravitySavingsProps {
  /** User's current total savings balance (display only) */
  currentSavings: number;
  /** User's display name shown next to the savings balance */
  userName: string;
  /** Avatar image source for the savings row */
  userAvatar?: any; // ImageSourcePropType
  /** Currency symbol — defaults to "$" */
  currencySymbol?: string;
  /** Quick-amount presets — defaults to $100 / $500 / $1000 */
  quickAmounts?: QuickAmountPill[];
  /**
   * Called when the user confirms a deposit.
   * Receives the numeric amount.
   * Should return a Promise so the component can await API resolution
   * before dismissing the coin animation.
   */
  onSave: (amount: number) => Promise<void>;
  /** Called after the success sheet is dismissed */
  onDone?: () => void;
  /** Called when the user taps "Return to Home" */
  onReturnHome?: () => void;
}

/** Internal animation state for the coin drop sequence */
export type CoinDropState = 'idle' | 'dropping' | 'success'

/** Shape of a single spawned coin tracked in component state */
export interface SpawnedCoin {
  id: string;
  offsetX: number;
  delay: number;
  landed: boolean;
}

/** Props for the SuccessSheet bottom sheet */
export interface SuccessSheetProps {
  /** Whether the sheet is visible */
  visible: boolean;
  /** Amount that was saved */
  amount: number;
  /** Currency symbol */
  currencySymbol: string;
  /** User display name */
  userName: string;
  /** Avatar image source */
  userAvatar?: any;
  /** "Done" button handler */
  onDone: () => void;
  /** "Return to Home" handler */
  onReturnHome: () => void;
}



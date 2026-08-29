import type { ComponentProps } from 'react';
import LottieView from "lottie-react-native";
import type { ImageSourcePropType } from 'react-native';

export interface FlipIconSource {
  readonly front: ImageSourcePropType;
  readonly back: ImageSourcePropType;
}

export type LottieSource = ComponentProps<typeof LottieView>['source'];

export interface Contact {
  readonly id: string;
  readonly avatar: ImageSourcePropType;
  readonly handle: string;
  readonly name?: string;
}

// ─── Avatar Carousel ────────────────────────────────────────────────────────

export interface AvatarCarouselProps {
  readonly contacts: readonly Contact[];
  /** Index centered on mount. Default: 3 */
  readonly initialIndex?: number;
  readonly onContactChange: (contact: Contact) => void;
  /** Height of the carousel container. Default: 120 */
  readonly height?: number;
}

// ─── Tick Slider ────────────────────────────────────────────────────────────

export interface TickSliderProps {
  readonly value: number;
  readonly onValueChange: (value: number) => void;
  /** Lower bound of the range. Default: 100 */
  readonly min?: number;
  /** Upper bound of the range. Default: 1800 */
  readonly max?: number;
  /** Distance between adjacent ticks. Default: 100 */
  readonly step?: number;
}

// ─── Send Status ────────────────────────────────────────────────────────────

export type SendStage = 'sending' | 'sent';

export interface SendStatusCardProps {
  readonly stage: SendStage;
  readonly sendingIconSource?: FlipIconSource;
  readonly sentIconSource?: FlipIconSource;
}



export type QuickPayStage = 'form' | SendStage;

export interface QuickPayCardProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly contacts: readonly Contact[];
  readonly initialAmount?: number;
  readonly onConfirm?: (amount: number, contact: Contact) => void | Promise<void>;
  readonly onSendError?: (error: unknown) => void;
  readonly minAmount?: number;
  readonly maxAmount?: number;
  readonly step?: number;
  readonly sendingIconSource?: FlipIconSource;
  readonly sentIconSource?: FlipIconSource;
  readonly backgroundSource?: LottieSource;
}
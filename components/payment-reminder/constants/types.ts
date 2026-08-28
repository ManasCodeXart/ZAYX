import type { ImageSourcePropType, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';


export interface Contact {
  readonly id: string;
  readonly avatar: ImageSourcePropType;
  readonly handle: string;
}


export interface PillData {
  readonly contact: Contact;
  readonly amount: string;
  readonly dateLabel: string;
  readonly countdownLabel: string;
  readonly daysRemaining: number;
}


export interface ReminderItem extends PillData {
  readonly id: string;
  readonly progress: number;
}



export interface AvatarCarouselProps {
  readonly contacts: readonly Contact[];
  readonly initialIndex?: number;
  readonly onContactChange: (contact: Contact) => void;
  readonly height?: number;
}



export interface KeypadProps {
  readonly onKeyPress: (key: string) => void;
  readonly decimalSeparator?: string;
  readonly hapticsEnabled?: boolean;
  readonly disabled?: boolean;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly keyStyle?: StyleProp<ViewStyle>;
  readonly keyTextStyle?: StyleProp<TextStyle>;
}



export interface DateScrollPickerProps {
  readonly min?: number;
  readonly max?: number;
  readonly value: number;
  readonly width?: number;
  readonly onValueChange: (value: number) => void;
}



export interface VerticalTickSliderProps {
  readonly value: number;
  readonly onValueChange: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly activeColor?: string;
  readonly inactiveColor?: string;
  readonly thumbColor?: string;
  readonly width?: number;
  readonly height?: number;
}




export interface ReminderPillProps {
  readonly data: PillData;
  readonly onPress: () => void;
  readonly translateX?: SharedValue<number>;
  readonly translateY?: SharedValue<number>;
  readonly draggable?: boolean;
}


export interface AmountKeypadSheetProps {
  readonly visible: boolean;
  readonly amount: string;
  readonly onAmountChange: (amount: string) => void;
  readonly decimalSeparator?: string;
  readonly hapticsEnabled?: boolean;
}

export interface ReminderCreateSheetProps {
  readonly contacts: readonly Contact[];
  readonly buttonLabel?: string;
  readonly initialIndex?: number;
  readonly onPillCreate: (pill: PillData) => void;
  readonly open?: boolean;       
  readonly onClose?: () => void; 
}

export type AnimatedCounterProps = Readonly<{
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  delay?: number
  decimals?: number
  style?: StyleProp<TextStyle>
}>

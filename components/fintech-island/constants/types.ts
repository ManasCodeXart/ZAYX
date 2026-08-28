import { ImageSourcePropType } from "react-native"

export type IslandState =
  | 'hidden'       
  | 'compact'      
  | 'expanded'     
  | 'success'      
  | 'dismissing'   


export interface RecentTransaction {
  id: string
  name: string
  handle: string
  amount: number
  currency: string
  avatarSource?: ImageSourcePropType  
}

export interface CarouselCard {
  id: string
  lastFour: string
  holderName: string
  expiry: string
  cvv: string
  backgroundImage: ImageSourcePropType
  paypassImage?: ImageSourcePropType
  networkLogo?: ImageSourcePropType
}

export interface TransactionData {
  avatarSource?: ImageSourcePropType
  recipientName: string
  recipientHandle: string
  amount: number
  currency: string
  recentTransactions: RecentTransaction[]
}



export interface CardAddedData {
  cardholderName: string
  cardholderHandle: string
  cardholderAvatar?: ImageSourcePropType
  cardBalance: number
  currencySymbol?: string         
  cards: CarouselCard[]
}

export interface SavingsData {
  goalName:        string
  amountSaved:     number
  totalSaved:      number
  goalTarget:      number
  currencySymbol?: string
  goalImage?:      ImageSourcePropType
  onViewSavings?:  () => void
}


export interface SendIslandProps {
  variant?: 'send'
  transaction: TransactionData
  visible: boolean
  onDismiss?: () => void
  onSendAgain?: (transaction: RecentTransaction) => void
}

export interface CardAddedIslandProps {
  variant: 'cardAdded'
  cardAdded: CardAddedData
  visible: boolean
  onDismiss?: () => void
  onAddMore?: () => void
}

export interface SavingsIslandProps {
  variant:  'savings'
  savings:  SavingsData
  visible:  boolean
  onDismiss?: () => void
}

export type FintechIslandProps =
  | SendIslandProps
  | CardAddedIslandProps
  | SavingsIslandProps


export interface FintechIslandRef {
  triggerSuccess: () => void
  dismiss: () => void
}

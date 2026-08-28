import { Dimensions } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export const CARD_WIDTH = SCREEN_WIDTH * 0.85
export const CARD_HEIGHT = CARD_WIDTH * 1.586
export const CARD_BORDER_RADIUS = 24

export const CARD_FLIP_SPRING = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
} as const

export const CARD_PAGE_DISTANCE_THRESHOLD = CARD_WIDTH * 0.28
export const CARD_PAGE_VELOCITY_THRESHOLD = 800

export const CARD_REVEAL_FADE_DURATION = 400
export const CARD_COUNTER_DURATION = 1000

export const CARD_FLIP_PERSPECTIVE = 600
export const CARD_FLIP_COMMIT_THRESHOLD_DEG = 45

export const CARD_COLORS = {
  text: '#FFFFFF',
  stripBackground: '#252525',
  stripBorder: 'rgba(255, 255, 255, 0.08)',
} as const

export const CARD_FONTS = {
  medium: 'SpaceGroteskMedium',
  bold: 'SpaceGroteskBold',
  accent: 'SpaceGroteskSemiBold',
} as const
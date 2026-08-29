import * as Haptics from 'expo-haptics'

import { verticalScale } from '../../utils/scaling'

export const HOVER_HAPTIC_STYLE = Haptics.ImpactFeedbackStyle.Light
export const SELECT_HAPTIC_STYLE = Haptics.ImpactFeedbackStyle.Medium

export const DEFAULT_HIT_RADIUS = verticalScale(80)

export const REVEAL_STAGGER_MS = 55
export const REVEAL_DURATION_MS = 420
export const DISMISS_DURATION_MS = 220

export const BACKDROP_MAX_OPACITY = 0.55
export const BACKDROP_FADE_IN_MS = 220
export const BACKDROP_FADE_OUT_MS = 260
export const DEFAULT_BACKDROP_COLOR = '#000000'

export const ACTIVE_SCALE_MULTIPLIER = 1.25
export const COIN_SPRING_CONFIG = { damping: 18, stiffness: 320 } as const

export const GLOW_OUTER_ALPHA_HEX = '18'
export const GLOW_INNER_ALPHA_HEX = '35'

export const BUTTON_WIDTH = verticalScale(190)
export const BUTTON_HEIGHT = verticalScale(52)
export const BUTTON_RADIUS = verticalScale(32)
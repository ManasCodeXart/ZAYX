import { verticalScale } from './scaling'

export const LOTTIE = {
  SENDING_LOOP_END:  0.52,
  RESOLVE_END:       0.6,
  LOOP_DURATION:     2000,
  RESOLVE_DURATION:  600,
  CARD_ADDED: {
    PLAY_DURATION: 900,
  },
} as const



export const ISLAND = {
  TOP:           verticalScale(12),
  HEADER_OFFSET: verticalScale(42),
  CARD_GAP:      verticalScale(10),

  PILL: {
    width:  verticalScale(180),
    height: verticalScale(40),
    radius: verticalScale(22),
  },

  CARD1: {
    width:  verticalScale(270),
    height: verticalScale(65),
    radius: verticalScale(14),
  },

  CARD2: {
    width:  verticalScale(320),
    height: verticalScale(140),
    radius: verticalScale(20),
  },
} as const

// ─── Spring Configs ───────────────────────────────────────────────────────────

export const SPRING_SNAPPY = {
  damping:   18,
  stiffness: 220,
  mass:      0.8,
}

export const SPRING_SMOOTH = {
  damping:   24,
  stiffness: 160,
  mass:      1,
}

export const SPRING_EXPAND = {
  damping:   14,
  stiffness: 240,
  mass:      0.75,
}

export const SPRING_COLLAPSE = {
  damping:   20,
  stiffness: 280,
  mass:      0.7,
}
import { Dimensions } from 'react-native'
import { verticalScale } from './theme'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// ─── Piggy Bank ────────────────────────────────────────────────────────────────

/** Width of the piggy bank PNG rendered on screen */
export const PIGGY_SIZE = SCREEN_WIDTH * 0.78

/**
 * Rendered height of the piggy bank PNG.
 * Keep in sync with piggyImage style in GravitySavingsScreen.
 */
export const PIGGY_HEIGHT = verticalScale(200)

/**
 * Absolute Y position of the coin slot on the piggy bank.
 * Measured from the top of the screen.
 *
 * HOW TO CALIBRATE:
 *   1. Render the screen on your target device
 *   2. Use onLayout on piggyContainer to get its pageY
 *   3. Add the visual slot offset from the top of the PNG
 *      (roughly 12–15% of PIGGY_HEIGHT for this pig asset)
 *   4. Replace SLOT_OFFSET_RATIO if needed
 *
 * Default assumes piggyContainer starts at ~verticalScale(8) from safe area top
 * and the slot sits at ~10% down from the top of the PNG.
 */
export const SLOT_OFFSET_RATIO = 0.10  // % from top of pig image to slot

/** Horizontal center of the slot — center of screen by default */
export const SLOT_CENTER_X = SCREEN_WIDTH / 2 

// ─── Coin Spawn Logic ─────────────────────────────────────────────────────────

/**
 * How many coins to spawn based on the saved amount.
 * Feels proportional — $10 = 1 coin, $100+ = 5 coins.
 */
export const getCoinCount = (amount: number): number => {
  if (amount <= 0)   return 0
  if (amount < 25)   return 1
  if (amount < 50)   return 2
  if (amount < 100)  return 3
  if (amount < 500)  return 4
  return 5
}

/**
 * Max X spread of coins from center so they fan out.
 * Each coin gets a random offset between -MAX_COIN_SPREAD and +MAX_COIN_SPREAD.
 */
export const MAX_COIN_SPREAD = verticalScale(50)

/** Y position where coins spawn — just above the visible screen top */
export const COIN_SPAWN_Y = -verticalScale(80)

/** Size of each falling coin PNG */
export const COIN_SIZE = verticalScale(48)

// ─── Timing ───────────────────────────────────────────────────────────────────

/** Delay between each coin spawning (ms) — creates the cascade feel */
export const COIN_STAGGER_DELAY = 240

/**
 * Duration for a coin to fall from spawn to slot (ms).
 * Uses Easing.in(Easing.quad) so it accelerates like gravity.
 */
export const COIN_FALL_DURATION = 1200

/**
 * Duration of the coin disappear on slot impact (ms).
 * Scale to 0 fast — looks like it entered the slot.
 */
export const COIN_ABSORB_DURATION = 10

/**
 * How long the last coin waits at the slot before absorbing,
 * if the API hasn't resolved yet (ms).
 * Prevents the coin from disappearing before save is confirmed.
 */
export const COIN_HOLD_TIMEOUT = 3000

// ─── Piggy Jiggle ─────────────────────────────────────────────────────────────

/** Rotation amount for piggy jiggle on coin impact (degrees) */
export const JIGGLE_DEGREES = 3

/** Duration of one jiggle oscillation (ms) */
export const JIGGLE_DURATION = 80
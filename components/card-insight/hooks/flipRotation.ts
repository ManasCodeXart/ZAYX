const FACE_BACK_RANGE_START = 90
const FACE_BACK_RANGE_END = 270

export function normalizeAngle(angle: number): number {
  'worklet'
  return ((angle % 360) + 360) % 360
}

export function isAngleShowingBack(normalizedAngle: number): boolean {
  'worklet'
  return normalizedAngle > FACE_BACK_RANGE_START && normalizedAngle < FACE_BACK_RANGE_END
}

export function getRotationProgress(normalizedAngle: number): number {
  'worklet'
  return normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle
}

export function resolveSnappedRotation(currentAngle: number): number {
  'worklet'
  const normalized = normalizeAngle(currentAngle)
  const fullRotations = Math.floor(currentAngle / 360) * 360
  const snappedFace = isAngleShowingBack(normalized) ? 180 : normalized > FACE_BACK_RANGE_END ? 360 : 0
  return fullRotations + snappedFace
}
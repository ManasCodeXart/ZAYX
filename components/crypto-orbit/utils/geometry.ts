export interface Point {
  readonly x: number
  readonly y: number
}

 
export function findNearestPointIndex(
  points: readonly Point[],
  origin: Point,
  touch: Point,
  radius: number
): number {
  'worklet'
  for (let i = 0; i < points.length; i++) {
    const dx = touch.x - (origin.x + points[i].x)
    const dy = touch.y - (origin.y + points[i].y)
    if (Math.hypot(dx, dy) < radius) return i
  }
  return -1
}

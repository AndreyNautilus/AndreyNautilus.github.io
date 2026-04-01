export type Point = {
  x: number
  y: number
}

export function createPoint(x: number, y: number): Point {
  return { x, y }
}

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

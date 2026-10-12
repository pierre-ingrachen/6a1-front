import { Line, Slot } from "game/models/game.model"

export interface PitchPoint {
  x: number
  y: number
}

const point = (x: number, y: number): PitchPoint => ({ x, y })

const GOALKEEPER = point(50, 91)
const FLAT_BACK_FOUR = [point(15, 68), point(37, 76), point(63, 76), point(85, 68)]

export const FORMATION_LAYOUTS: Record<string, PitchPoint[]> = {
  "4-3-3": [
    GOALKEEPER,
    ...FLAT_BACK_FOUR,
    point(27, 47),
    point(50, 56),
    point(73, 47),
    point(17, 27),
    point(50, 15),
    point(83, 27),
  ],
  "4-4-2": [
    GOALKEEPER,
    ...FLAT_BACK_FOUR,
    point(13, 45),
    point(37, 50),
    point(63, 50),
    point(87, 45),
    point(37, 18),
    point(63, 18),
  ],
  "4-2-3-1": [
    GOALKEEPER,
    ...FLAT_BACK_FOUR,
    point(36, 56),
    point(64, 56),
    point(17, 33),
    point(50, 36),
    point(83, 33),
    point(50, 14),
  ],
  "3-5-2": [
    GOALKEEPER,
    point(27, 74),
    point(50, 76),
    point(73, 74),
    point(10, 52),
    point(90, 52),
    point(32, 43),
    point(50, 57),
    point(68, 43),
    point(37, 18),
    point(63, 18),
  ],
  "5-3-2": [
    GOALKEEPER,
    point(10, 63),
    point(30, 74),
    point(50, 76),
    point(70, 74),
    point(90, 63),
    point(28, 46),
    point(50, 54),
    point(72, 46),
    point(37, 18),
    point(63, 18),
  ],
}

const DEFAULT_LINE_HEIGHTS: Record<Line, number> = {
  GOALKEEPER: 91,
  DEFENDER: 72,
  MIDFIELDER: 47,
  ATTACKER: 20,
}

const defaultPointOf = (slot: Slot, slots: Slot[]): PitchPoint => {
  const sameLine = slots.filter((other) => other.line === slot.line)
  const rank = sameLine.findIndex((other) => other.index === slot.index)
  return point(((rank + 1) * 100) / (sameLine.length + 1), DEFAULT_LINE_HEIGHTS[slot.line])
}

export const pitchPointsOf = (formation: string, slots: Slot[]): PitchPoint[] =>
  slots.map((slot) => FORMATION_LAYOUTS[formation]?.[slot.index] ?? defaultPointOf(slot, slots))

import { Line, Slot } from "game/models/game.model"
import { groupSlotsByLine } from "game/utils/slot-layout"

export interface PlacedSlot {
  slot: Slot
  x: number
  y: number
}

const LINE_HEIGHTS: Record<Line, number> = {
  ATTACKER: 14,
  MIDFIELDER: 41,
  DEFENDER: 68,
  GOALKEEPER: 86,
}

const GOALKEEPER_X = 48
const SIDE_MARGIN = 12.5

const horizontalPositions = (count: number): number[] => {
  if (count === 1) return [GOALKEEPER_X]
  if (count === 2) return [30, 66]
  return Array.from({ length: count }, (_, index) => SIDE_MARGIN + (index * (100 - 2 * SIDE_MARGIN)) / (count - 1))
}

export const placeSlots = (slots: Slot[]): PlacedSlot[] =>
  groupSlotsByLine(slots).flatMap((row) => {
    const abscissas = horizontalPositions(row.slots.length)
    return row.slots.map((slot, index) => ({ slot, x: abscissas[index], y: LINE_HEIGHTS[row.line] }))
  })

export const shortName = (fullName: string): string => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return rest.length === 0 ? firstName : `${firstName[0]}.${rest.join(" ")}`
}

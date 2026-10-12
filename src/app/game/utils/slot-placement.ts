import { Slot } from "game/models/game.model"
import { layoutRowsOf } from "game/utils/formation-layouts"
import { groupSlotsByLine } from "game/utils/slot-layout"

export interface PlacedSlot {
  slot: Slot
  x: number
  y: number
}

const FIRST_ROW_HEIGHT = 14
const LAST_OUTFIELD_ROW_HEIGHT = 68
const GOALKEEPER_HEIGHT = 86
const GOALKEEPER_X = 48
const LEFT_MARGIN = 12.5
const RIGHT_MARGIN = 83.5

const horizontalPositions = (count: number): number[] => {
  if (count === 1) return [GOALKEEPER_X]
  if (count === 2) return [30, 66]
  return Array.from({ length: count }, (_, index) => LEFT_MARGIN + (index * (RIGHT_MARGIN - LEFT_MARGIN)) / (count - 1))
}

const rowHeights = (rowCount: number): number[] => {
  const outfieldRows = rowCount - 1
  const step = outfieldRows > 1 ? (LAST_OUTFIELD_ROW_HEIGHT - FIRST_ROW_HEIGHT) / (outfieldRows - 1) : 0
  return Array.from({ length: rowCount }, (_, index) =>
    index === outfieldRows ? GOALKEEPER_HEIGHT : FIRST_ROW_HEIGHT + index * step,
  )
}

const rowsOf = (slots: Slot[], formation: string): Slot[][] =>
  layoutRowsOf(formation, slots) ?? groupSlotsByLine(slots).map((row) => row.slots)

export const placeSlots = (slots: Slot[], formation = ""): PlacedSlot[] => {
  const rows = rowsOf(slots, formation)
  const heights = rowHeights(rows.length)
  return rows.flatMap((row, rowIndex) => {
    const abscissas = horizontalPositions(row.length)
    return row.map((slot, index) => ({ slot, x: abscissas[index], y: heights[rowIndex] }))
  })
}

export const shortName = (fullName: string): string => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return rest.length === 0 ? firstName : `${firstName[0]}.${rest.join(" ")}`
}

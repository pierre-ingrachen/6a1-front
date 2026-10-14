import { Slot } from "game/models/game.model"
import { layoutRowsOf } from "game/utils/formation-layouts"
import { LEFT_POSITIONS, RIGHT_POSITIONS, groupSlotsByLine } from "game/utils/slot-layout"

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
const WING_BACK_LIFT = 4
const WING_BACKS = ["LB", "RB"]
const FIVE_BACK_CENTER_BACKS = 3

const isWideRow = (row: Slot[]): boolean =>
  row.length === 2 && LEFT_POSITIONS.includes(row[0].position) && RIGHT_POSITIONS.includes(row[1].position)

const isLiftedWingBack = (slot: Slot, row: Slot[]): boolean =>
  WING_BACKS.includes(slot.position) && row.filter((other) => other.position === "CB").length >= FIVE_BACK_CENTER_BACKS

const horizontalPositions = (row: Slot[]): number[] => {
  const count = row.length
  if (isWideRow(row)) return [LEFT_MARGIN, RIGHT_MARGIN]
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
    const abscissas = horizontalPositions(row)
    return row.map((slot, index) => ({
      slot,
      x: abscissas[index],
      y: heights[rowIndex] - (isLiftedWingBack(slot, row) ? WING_BACK_LIFT : 0),
    }))
  })
}

export const shortName = (fullName: string): string => {
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  return rest.length === 0 ? firstName : `${firstName[0]}.${rest.join(" ")}`
}

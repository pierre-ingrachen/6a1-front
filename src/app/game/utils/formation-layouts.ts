import { Slot } from "game/models/game.model"

const FORMATION_ROWS_FROM_ATTACK: Record<string, string[][]> = {
  "4-3-3": [["LW", "ST", "RW"], ["CM", "CM", "CM"], ["LB", "CB", "CB", "RB"]],
  "4-4-2": [["ST", "ST"], ["LM", "CM", "CM", "RM"], ["LB", "CB", "CB", "RB"]],
  "4-2-3-1": [["ST"], ["LW", "AM", "RW"], ["DM", "DM"], ["LB", "CB", "CB", "RB"]],
  "3-5-2": [["ST", "ST"], ["LM", "CM", "CM", "CM", "RM"], ["CB", "CB", "CB"]],
  "5-3-2": [["ST", "ST"], ["CM", "CM", "CM"], ["LB", "CB", "CB", "CB", "RB"]],
  "4-1-4-1": [["ST"], ["LM", "CM", "CM", "RM"], ["DM"], ["LB", "CB", "CB", "RB"]],
  "4-2-4": [["LW", "ST", "ST", "RW"], ["CM", "CM"], ["LB", "CB", "CB", "RB"]],
  "4-1-2-1-2": [["ST", "ST"], ["AM"], ["CM", "CM"], ["DM"], ["LB", "CB", "CB", "RB"]],
  "3-4-3": [["LW", "ST", "RW"], ["LM", "CM", "CM", "RM"], ["CB", "CB", "CB"]],
  "3-4-2-1": [["ST"], ["AM", "AM"], ["LM", "CM", "CM", "RM"], ["CB", "CB", "CB"]],
  "5-4-1": [["ST"], ["LM", "CM", "CM", "RM"], ["LB", "CB", "CB", "CB", "RB"]],
  "5-2-3": [["LW", "ST", "RW"], ["CM", "CM"], ["LB", "CB", "CB", "CB", "RB"]],
}

export const layoutRowsOf = (formation: string, slots: Slot[]): Slot[][] | null => {
  const rows = FORMATION_ROWS_FROM_ATTACK[formation]
  const goalkeepers = slots.filter((slot) => slot.position === "GK")
  if (!rows) return null

  const queues = slots
    .filter((slot) => slot.position !== "GK")
    .reduce((byPosition, slot) => byPosition.set(slot.position, [...(byPosition.get(slot.position) ?? []), slot]), new Map<string, Slot[]>())
  const placedRows = rows.map((positions) => positions.map((position) => queues.get(position)?.shift()))
  const complete = placedRows.every((row) => row.every((slot) => slot !== undefined))
  const nothingLeft = [...queues.values()].every((queue) => queue.length === 0)

  return complete && nothingLeft && goalkeepers.length === 1
    ? [...(placedRows as Slot[][]), goalkeepers]
    : null
}

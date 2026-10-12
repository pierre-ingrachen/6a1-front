import { Slot } from "game/models/game.model"

const FORMATION_ROWS_FROM_ATTACK: Record<string, string[][]> = {
  "4-3-3": [["LW", "ST", "RW"], ["CM", "CM", "CM"], ["LB", "CB", "CB", "RB"]],
  "4-4-2": [["ST", "ST"], ["LW", "CM", "CM", "RW"], ["LB", "CB", "CB", "RB"]],
  "4-2-3-1": [["ST"], ["LW", "AM", "RW"], ["CM", "CM"], ["LB", "CB", "CB", "RB"]],
  "3-5-2": [["ST", "ST"], ["LWB", "CM", "CM", "CM", "RWB"], ["CB", "CB", "CB"]],
  "5-3-2": [["ST", "ST"], ["CM", "CM", "CM"], ["LWB", "CB", "CB", "CB", "RWB"]],
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

import { Line, Slot } from "game/models/game.model"

export interface SlotRow {
  line: Line
  slots: Slot[]
}

const LINES_FROM_ATTACK: Line[] = ["ATTACKER", "MIDFIELDER", "DEFENDER", "GOALKEEPER"]
const LEFT_POSITIONS = ["LB", "LM", "LW"]
const RIGHT_POSITIONS = ["RB", "RM", "RW"]

const lateralRank = (position: string): number => {
  if (LEFT_POSITIONS.includes(position)) return 0
  if (RIGHT_POSITIONS.includes(position)) return 2
  return 1
}

export const groupSlotsByLine = (slots: Slot[]): SlotRow[] =>
  LINES_FROM_ATTACK.map((line) => ({
    line,
    slots: slots
      .filter((slot) => slot.line === line)
      .sort((first, second) => lateralRank(first.position) - lateralRank(second.position)),
  })).filter((row) => row.slots.length > 0)

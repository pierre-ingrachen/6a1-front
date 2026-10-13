import { Line, Slot } from "game/models/game.model"

const LINE_BY_POSITION: Record<string, Line> = {
  GK: "GOALKEEPER",
  LB: "DEFENDER",
  CB: "DEFENDER",
  RB: "DEFENDER",
  DM: "MIDFIELDER",
  CM: "MIDFIELDER",
  LM: "MIDFIELDER",
  RM: "MIDFIELDER",
  AM: "MIDFIELDER",
  LW: "ATTACKER",
  RW: "ATTACKER",
  ST: "ATTACKER",
}

export const previewSlotsOf = (positions: string[]): Slot[] =>
  positions.map((position, index) => ({
    index,
    position,
    line: LINE_BY_POSITION[position] ?? "MIDFIELDER",
    player: null,
  }))

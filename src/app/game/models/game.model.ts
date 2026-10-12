export type Line = "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "ATTACKER"
export type RedrawType = "SEASON" | "TEAM"
export type GameStatus = "DRAFTING" | "READY_TO_SIMULATE" | "COMPLETED"
export type Round = "GROUP_STAGE" | "ROUND_OF_16" | "QUARTER_FINAL" | "SEMI_FINAL" | "FINAL" | "WINNER"

export interface Formation {
  label: string
  positions: string[]
}

export interface PickedPlayer {
  playerId: number
  name: string
  rating: number
  teamName: string
  seasonLabel: string
  positions: string[]
}

export interface Slot {
  index: number
  position: string
  line: Line
  player: PickedPlayer | null
}

export interface DrawPlayer {
  playerId: number
  name: string
  rating: number
  line: Line
  positions: string[]
  eligibleSlots: number[]
  alreadyPicked: boolean
}

export interface Draw {
  teamId: number
  teamName: string
  country: string
  seasonLabel: string
  players: DrawPlayer[]
}

export interface Game {
  id: string
  formation: string
  status: GameStatus
  picksRemaining: number
  redrawsRemaining: number
  squadAverageRating: number | null
  slots: Slot[]
  draw: Draw | null
}

export interface PickCommand {
  playerId: number
  slotIndex: number
}

export interface MoveCommand {
  fromSlot: number
  toSlot: number
}

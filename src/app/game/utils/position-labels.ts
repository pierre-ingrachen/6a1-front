import { Round } from "game/models/game.model"

const POSITION_LABELS: Record<string, string> = {
  GK: "GB",
  LB: "DG",
  CB: "DC",
  RB: "DD",
  LWB: "PG",
  RWB: "PD",
  CM: "MC",
  AM: "MOC",
  LW: "AG",
  RW: "AD",
  ST: "BU",
}

const POSITION_NAMES: Record<string, string> = {
  GK: "Gardien",
  LB: "Latéral gauche",
  CB: "Défenseur central",
  RB: "Latéral droit",
  LWB: "Piston gauche",
  RWB: "Piston droit",
  CM: "Milieu central",
  AM: "Milieu offensif",
  LW: "Ailier gauche",
  RW: "Ailier droit",
  ST: "Avant-centre",
}

const ROUND_LABELS: Record<Round, string> = {
  GROUP_STAGE: "Phase de groupes",
  ROUND_OF_16: "Huitième de finale",
  QUARTER_FINAL: "Quart de finale",
  SEMI_FINAL: "Demi-finale",
  FINAL: "Finale",
  WINNER: "Vainqueur",
}

export const positionLabel = (position: string): string => POSITION_LABELS[position] ?? position
export const positionName = (position: string): string => POSITION_NAMES[position] ?? position
export const roundLabel = (round: Round): string => ROUND_LABELS[round]

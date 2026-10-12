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

const FORMATION_NAMES: Record<string, string> = {
  "4-3-3": "Offensive",
  "4-4-2": "Classique",
  "4-2-3-1": "Moderne",
  "3-5-2": "Pistons",
  "5-3-2": "Défensive",
  "4-1-2-1-2": "Losange",
  "4-3-2-1": "Sapin",
  "4-4-1-1": "Avec meneur",
  "4-5-1": "Milieu renforcé",
  "3-4-3": "Tout pour l'attaque",
  "3-4-2-1": "Double meneur",
  "5-4-1": "Verrou",
}

export const formationName = (formation: string): string => FORMATION_NAMES[formation] ?? ""
export const positionLabel =(position: string): string => POSITION_LABELS[position] ?? position
export const positionName = (position: string): string => POSITION_NAMES[position] ?? position
export const roundLabel = (round: Round): string => ROUND_LABELS[round]

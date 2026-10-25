import { Round } from "game/models/game.model"

const POSITION_LABELS: Record<string, string> = {
  GK: "GB",
  LB: "DG",
  CB: "DC",
  RB: "DD",
  DM: "MDC",
  CM: "MC",
  LM: "MG",
  RM: "MD",
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
  DM: "Milieu défensif",
  CM: "Milieu central",
  LM: "Milieu gauche",
  RM: "Milieu droit",
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

interface FormationDisplay {
  title: string
  variant: string
}

const FORMATION_DISPLAYS: Record<string, FormationDisplay> = {
  "4-3-3": { title: "4-3-3", variant: "Équilibré" },
  "4-1-2-3": { title: "4-3-3", variant: "Défensif" },
  "4-2-1-3": { title: "4-3-3", variant: "Offensif" },
  "4-4-2": { title: "4-4-2", variant: "Équilibré" },
  "4-2-2-2": { title: "4-4-2", variant: "Défensif" },
  "4-2-3-1": { title: "4-2-3-1", variant: "" },
  "4-1-4-1": { title: "4-1-4-1", variant: "" },
  "4-2-4": { title: "4-2-4", variant: "" },
  "3-4-3": { title: "3-4-3", variant: "Équilibré" },
  "3-2-2-3": { title: "3-4-3", variant: "Défensif" },
  "4-1-2-1-2": { title: "4-1-2-1-2", variant: "Losange" },
  "4-1-3-2": { title: "4-1-2-1-2", variant: "Large" },
  "3-5-2": { title: "3-5-2", variant: "Équilibré" },
  "3-1-4-2": { title: "3-5-2", variant: "Défensif" },
  "3-4-1-2": { title: "3-5-2", variant: "Offensif" },
  "3-4-2-1": { title: "3-4-2-1", variant: "" },
  "5-3-2": { title: "5-3-2", variant: "Équilibré" },
  "5-1-2-2": { title: "5-3-2", variant: "Défensif" },
  "5-2-1-2": { title: "5-3-2", variant: "Offensif" },
  "5-2-3": { title: "5-2-3", variant: "" },
  "5-4-1": { title: "5-4-1", variant: "" },
}

const isFamilyVariant = (formation: string): boolean => {
  const title = FORMATION_DISPLAYS[formation]?.title
  return Object.values(FORMATION_DISPLAYS).filter((display) => display.title === title).length > 1
}

export const formationTitle = (formation: string): string => FORMATION_DISPLAYS[formation]?.title ?? formation
export const formationVariant = (formation: string): string => FORMATION_DISPLAYS[formation]?.variant ?? ""
export const formationDisplayName = (formation: string): string =>
  isFamilyVariant(formation) ? `${formationTitle(formation)} ${formationVariant(formation).toLowerCase()}` : formationTitle(formation)
export const positionLabel =(position: string): string => POSITION_LABELS[position] ?? position
export const positionName = (position: string): string => POSITION_NAMES[position] ?? position
export const roundLabel = (round: Round): string => ROUND_LABELS[round]

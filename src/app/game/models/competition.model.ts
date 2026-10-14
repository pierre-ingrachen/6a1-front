import { Line, Round } from "game/models/game.model"

export interface TeamStrength {
  attack: number
  defense: number
}

export interface OpponentPlayer {
  name: string
  rating: number
  line: Line
}

export interface OpponentSummary {
  teamId: number
  teamName: string
  seasonLabel: string
  rating: number
  players: OpponentPlayer[]
}

export interface MatchResult {
  round: Round
  opponent: OpponentSummary
  goalsFor: number
  goalsAgainst: number
  extraTime: boolean
  penaltiesFor: number | null
  penaltiesAgainst: number | null
  won: boolean
}

export interface GroupStanding {
  teamName: string
  seasonLabel: string
  player: boolean
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
  goalDifference: number
}

export interface GroupStageResult {
  matches: MatchResult[]
  standings: GroupStanding[]
  rank: number
}

export interface CompetitionResult {
  squadStrength: TeamStrength
  groupStage: GroupStageResult
  knockoutMatches: MatchResult[]
  outcome: Round
  champion: boolean
}

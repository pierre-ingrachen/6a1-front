import { MatchResult } from "game/models/competition.model"

export type GoalSide = "FOR" | "AGAINST"

export interface GoalEvent {
  minute: number
  side: GoalSide
  scorerName: string | null
}

export interface MatchStep {
  label: string
  match: MatchResult
  goals: GoalEvent[]
  duration: number
}


import { GoalEvent } from "game/models/simulation.model"

export interface TopScorer {
  name: string
  goals: number
}

export const topScorerOf = (goals: GoalEvent[]): TopScorer | null => {
  const tally = new Map<string, number>()
  let leader: TopScorer | null = null
  goals
    .filter((goal) => goal.side === "FOR" && goal.scorerName !== null)
    .forEach((goal) => {
      const name = goal.scorerName as string
      const count = (tally.get(name) ?? 0) + 1
      tally.set(name, count)
      if (!leader || count > leader.goals) {
        leader = { name, goals: count }
      }
    })
  return leader
}

export interface SimulationSpeed {
  id: string
  label: string
  minuteMs: number
  kickMs: number
}

export const SIMULATION_SPEEDS: SimulationSpeed[] = [
  { id: "slow", label: "Lent", minuteMs: 140, kickMs: 2800 },
  { id: "normal", label: "Normal", minuteMs: 90, kickMs: 1800 },
  { id: "fast", label: "Très rapide", minuteMs: 8, kickMs: 150 },
]

export const DEFAULT_SIMULATION_SPEED = SIMULATION_SPEEDS[1]

const SUSPENSE_PHASES = [
  { remainingMinutes: 3, slowdown: 4 },
  { remainingMinutes: 6, slowdown: 2.5 },
  { remainingMinutes: 10, slowdown: 1.5 },
]

const periodEndOf = (minute: number): number => (minute <= 90 ? 90 : 120)

export const minuteDelayMs = (speed: SimulationSpeed, minute: number): number => {
  const remaining = periodEndOf(minute) - minute
  const phase = SUSPENSE_PHASES.find((candidate) => remaining < candidate.remainingMinutes)
  return speed.minuteMs * (phase?.slowdown ?? 1)
}

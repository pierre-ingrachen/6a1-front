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

export interface Season {
  startYear: number
  label: string
}

export interface SeasonOption extends Season {
  teamName?: string
}

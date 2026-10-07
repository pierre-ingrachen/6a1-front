export interface PlayerSeasonTeam {
  startYear: number
  teamName: string
}

export interface PlayerSearchResult {
  id: number
  name: string
  position: string
  teamName: string
  seasons: PlayerSeasonTeam[]
}

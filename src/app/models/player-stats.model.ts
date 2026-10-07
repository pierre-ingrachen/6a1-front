export interface StatValue {
  value: number | null
  percentile: number | null
  topPercent: number | null
}

export interface PlayerStat {
  key: string
  label: string
  detail: boolean
  lowerIsBetter: boolean
  total: StatValue
  per90: StatValue
}

export interface StatCategory {
  key: string
  label: string
  stats: PlayerStat[]
}

export interface PlayerStats {
  id: number
  name: string
  position: string
  heightCm: number | null
  weightKg: number | null
  teamName: string
  teamEstimated: boolean
  rating: number | null
  averageRating: number | null
  minutes: number
  categories: StatCategory[]
}

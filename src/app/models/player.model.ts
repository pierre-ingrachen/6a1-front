export interface Player {
  id: number
  name: string
  position: string
  goals: number | null
  assists: number | null
  averageRating: number | null
  rating: number | null
  matchesPlayed: number
}

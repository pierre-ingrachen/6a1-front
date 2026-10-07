// Seuils calés sur la distribution des notes moyennes en base (P25 = 6.29, P50 = 6.60, P75 = 6.92, P90 = 7.22)
export type RatingLevel = "poor" | "average" | "good" | "great" | "outstanding" | "none"

export function ratingLevel(rating: number | null | undefined): RatingLevel {
  if (rating === null || rating === undefined) return "none"
  if (rating < 6.3) return "poor"
  if (rating < 6.6) return "average"
  if (rating < 6.9) return "good"
  if (rating < 7.2) return "great"
  return "outstanding"
}

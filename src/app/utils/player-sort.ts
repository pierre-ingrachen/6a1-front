import { Player } from "models/player.model"

export type PlayerSortKey = "name" | "goals" | "assists" | "averageRating"

export type SortDirection = "asc" | "desc"

export const PLAYER_SORT_OPTIONS: { key: PlayerSortKey; label: string }[] = [
  { key: "name", label: "Nom" },
  { key: "goals", label: "Buts" },
  { key: "assists", label: "Passes décisives" },
  { key: "averageRating", label: "Note moyenne" },
]

export function defaultSortDirection(key: PlayerSortKey): SortDirection {
  return key === "name" ? "asc" : "desc"
}

// Valeurs absentes toujours en fin de liste, quel que soit le sens.
export function sortPlayers(players: Player[], key: PlayerSortKey, direction: SortDirection): Player[] {
  const sign = direction === "asc" ? 1 : -1
  return [...players].sort((a, b) => {
    if (key === "name") return sign * a.name.localeCompare(b.name)
    const [x, y] = [a[key], b[key]]
    if (x === null && y === null) return a.name.localeCompare(b.name)
    if (x === null) return 1
    if (y === null) return -1
    return sign * (x - y) || a.name.localeCompare(b.name)
  })
}

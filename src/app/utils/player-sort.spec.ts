import { Player } from "models/player.model"
import { sortPlayers } from "utils/player-sort"

describe("sortPlayers", () => {
  const p = (name: string, goals: number | null, assists: number | null, averageRating: number | null): Player => ({
    id: 0, name, position: "Forward", goals, assists, averageRating, matchesPlayed: 0,
  })
  const players = [p("Bob", 2, null, 6.5), p("Alice", 5, 1, null), p("Carl", 5, 3, 7.1)]
  const names = (key: Parameters<typeof sortPlayers>[1], dir: Parameters<typeof sortPlayers>[2] = key === "name" ? "asc" : "desc") => sortPlayers(players, key, dir).map((x) => x.name)

  it("sorts by name", () => expect(names("name")).toEqual(["Alice", "Bob", "Carl"]))
  it("sorts goals descending, ties by name", () => expect(names("goals")).toEqual(["Alice", "Carl", "Bob"]))
  it("puts missing assists last", () => expect(names("assists")).toEqual(["Carl", "Alice", "Bob"]))
  it("puts missing ratings last", () => expect(names("averageRating")).toEqual(["Carl", "Bob", "Alice"]))
  it("sorts name descending", () => expect(names("name", "desc")).toEqual(["Carl", "Bob", "Alice"]))
  it("sorts goals ascending", () => expect(names("goals", "asc")).toEqual(["Bob", "Alice", "Carl"]))
  it("keeps missing ratings last when ascending", () => expect(names("averageRating", "asc")).toEqual(["Bob", "Carl", "Alice"]))
  it("does not mutate the input", () => {
    sortPlayers(players, "goals", "desc")
    expect(players.map((x) => x.name)).toEqual(["Bob", "Alice", "Carl"])
  })
})

export interface DreamPlayer {
  playerId: number
  name: string
  position: string
  seasonStartYear: number
  captain?: boolean
}

export const DREAM_TEAM: DreamPlayer[] = [
  { playerId: 73798, name: "Courtois", position: "GK", seasonStartYear: 2021 },
  { playerId: 395221, name: "Nuno Mendes", position: "LB", seasonStartYear: 2024 },
  { playerId: 21541, name: "Hummels", position: "CB", seasonStartYear: 2023 },
  { playerId: 101949, name: "Marquinhos", position: "CB", seasonStartYear: 2024 },
  { playerId: 320834, name: "Hakimi", position: "RB", seasonStartYear: 2024 },
  { playerId: 31772, name: "Kroos", position: "CM", seasonStartYear: 2011 },
  { playerId: 9486, name: "Iniesta", position: "CM", seasonStartYear: 2010 },
  { playerId: 20874, name: "Modric", position: "CM", seasonStartYear: 2013 },
  { playerId: 5583, name: "Ronaldo", position: "LW", seasonStartYear: 2013 },
  { playerId: 29400, name: "Lewandowski", position: "ST", seasonStartYear: 2019 },
  { playerId: 11119, name: "Messi", position: "RW", seasonStartYear: 2014, captain: true },
]

export interface DreamPlayer {
  playerId: number
  name: string
  position: string
  seasonStartYear: number
  captain?: boolean
}

export const DREAM_TEAM: DreamPlayer[] = [
  { playerId: 35758, name: "Sommer", position: "GK", seasonStartYear: 2024 },
  { playerId: 128967, name: "Cancelo", position: "LB", seasonStartYear: 2023 },
  { playerId: 9909, name: "Sergio Ramos", position: "CB", seasonStartYear: 2016, captain: true },
  { playerId: 101949, name: "Marquinhos", position: "CB", seasonStartYear: 2024 },
  { playerId: 283323, name: "Kimmich", position: "RB", seasonStartYear: 2020 },
  { playerId: 74939, name: "Thiago", position: "CM", seasonStartYear: 2015 },
  { playerId: 44721, name: "Busquets", position: "CM", seasonStartYear: 2010 },
  { playerId: 31772, name: "Kroos", position: "CM", seasonStartYear: 2011 },
  { playerId: 300713, name: "Mbappé", position: "LW", seasonStartYear: 2025 },
  { playerId: 5583, name: "Ronaldo", position: "ST", seasonStartYear: 2015 },
  { playerId: 11119, name: "Messi", position: "RW", seasonStartYear: 2014 },
]

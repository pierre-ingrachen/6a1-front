import { Routes } from "@angular/router"
export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("home/home.component").then((module) => module.HomeComponent),
  },
  {
    path: "jeu",
    loadComponent: () => import("game/game-page/game-page.component").then((module) => module.GamePageComponent),
  },
  {
    path: "lineup",
    loadComponent: () => import("lineup/lineup-demo/lineup-demo.component").then((module) => module.LineupDemoComponent),
  },
  {
    path: "teams",
    loadComponent: () => import("teams/team-list/team-list.component").then((module) => module.TeamListComponent),
  },
  {
    path: "joueurs",
    loadComponent: () =>
      import("players/player-search-page/player-search-page.component").then((module) => module.PlayerSearchPageComponent),
  },
  {
    path: "joueurs/:playerId",
    loadComponent: () =>
      import("players/player-profile/player-profile.component").then((module) => module.PlayerProfileComponent),
  },
  {
    path: "compare",
    loadComponent: () =>
      import("compare/player-compare/player-compare.component").then((module) => module.PlayerCompareComponent),
  },
  {
    path: "**",
    loadComponent: () => import("not-found/not-found.component").then((module) => module.NotFoundComponent),
  },
]

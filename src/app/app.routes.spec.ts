import { PlayerSearchPageComponent } from "players/player-search-page/player-search-page.component"
import { routes } from "app.routes"

describe("routes", () => {
  it("serves the player search page on /joueurs", async () => {
    const route = routes.find((candidate) => candidate.path === "joueurs")

    expect(await route?.loadComponent?.()).toBe(PlayerSearchPageComponent)
  })
})

import { ComponentFixture, TestBed } from "@angular/core/testing"
import { By } from "@angular/platform-browser"
import { Router } from "@angular/router"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { provideHttpClientTesting } from "@angular/common/http/testing"
import { provideHttpClient } from "@angular/common/http"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { PlayerSearchPageComponent } from "players/player-search-page/player-search-page.component"
import { PlayerSearchResult } from "models/player-search-result.model"

describe("PlayerSearchPageComponent", () => {
  let fixture: ComponentFixture<PlayerSearchPageComponent>
  let router: jasmine.SpyObj<Router>

  const player: PlayerSearchResult = {
    id: 300713,
    name: "Kylian Mbappé",
    position: "Forward",
    teamName: "Real Madrid",
    seasons: [
      { startYear: 2023, teamName: "Real Madrid" },
      { startYear: 2025, teamName: "Real Madrid" },
    ],
  }

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>("Router", ["navigate"])
    TestBed.configureTestingModule({
      imports: [PlayerSearchPageComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: Router, useValue: router }],
    })
    fixture = TestBed.createComponent(PlayerSearchPageComponent)
    fixture.detectChanges()
  })

  it("opens the profile of the selected player on its latest season", () => {
    fixture.debugElement.query(By.directive(PlayerSearchComponent)).componentInstance.playerSelected.emit(player)

    expect(router.navigate).toHaveBeenCalledWith(["/joueurs", 300713], { queryParams: { season: 2025 } })
  })

  it("opens the profile without season when the player has none", () => {
    fixture.componentInstance.openProfile({ ...player, seasons: [] })

    expect(router.navigate).toHaveBeenCalledWith(["/joueurs", 300713], { queryParams: {} })
  })
})

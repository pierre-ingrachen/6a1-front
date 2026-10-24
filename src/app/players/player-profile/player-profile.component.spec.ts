import { ComponentFixture, TestBed } from "@angular/core/testing"
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from "@angular/router"
import { of, throwError } from "rxjs"
import { PlayerProfileComponent } from "players/player-profile/player-profile.component"
import { PlayerStats } from "models/player-stats.model"
import { PlayerService } from "services/player.service"
import { SeasonService } from "services/season.service"

const stats: PlayerStats = {
  id: 11119,
  name: "Lionel Messi",
  position: "Forward",
  heightCm: 170,
  weightKg: 72,
  teamName: "PSG",
  teamEstimated: false,
  rating: 86,
  averageRating: 7.85,
  minutes: 630,
  categories: [
    {
      key: "GOALS",
      label: "Buts",
      stats: [
        {
          key: "GOALS_SCORED",
          label: "Buts",
          detail: false,
          lowerIsBetter: false,
          total: { value: 5, percentile: 95, topPercent: 5 },
          per90: { value: 0.7, percentile: 90, topPercent: 10 },
        },
      ],
    },
  ],
}

describe("PlayerProfileComponent", () => {
  let playerService: jasmine.SpyObj<PlayerService>
  let fixture: ComponentFixture<PlayerProfileComponent>

  const element = (): HTMLElement => fixture.nativeElement

  const render = (queryParams: Record<string, string> = {}) => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap({ playerId: "11119" }) }, queryParamMap: of(convertToParamMap(queryParams)) },
    })
    fixture = TestBed.createComponent(PlayerProfileComponent)
    fixture.detectChanges()
    fixture.detectChanges()
  }

  beforeEach(() => {
    playerService = jasmine.createSpyObj<PlayerService>("PlayerService", ["findPlayerStats"])
    playerService.findPlayerStats.and.returnValue(of(stats))
    TestBed.configureTestingModule({
      imports: [PlayerProfileComponent],
      providers: [
        provideRouter([]),
        { provide: PlayerService, useValue: playerService },
        {
          provide: SeasonService,
          useValue: {
            findAllSeasons: () =>
              of([
                { startYear: 2025, label: "2025/2026" },
                { startYear: 2024, label: "2024/2025" },
              ]),
          },
        },
      ],
    })
  })

  it("loads the latest season by default and displays the profile", () => {
    render()

    expect(playerService.findPlayerStats).toHaveBeenCalledOnceWith(11119, 2025)
    expect(element().querySelector("h1")?.textContent).toBe("Lionel Messi")
    expect(element().textContent).toContain("86/99")
    expect(element().textContent).toContain("Attaquant · PSG")
  })

  it("loads the season given in the URL", () => {
    render({ season: "2024" })

    expect(playerService.findPlayerStats).toHaveBeenCalledOnceWith(11119, 2024)
  })

  it("switches the stats between totals and per 90 minutes", () => {
    render()
    expect(element().querySelector(".stat .value")?.textContent?.trim()).toBe("5")

    const mode = element().querySelector<HTMLSelectElement>("#mode")!
    mode.value = "per90"
    mode.dispatchEvent(new Event("change"))
    fixture.detectChanges()

    expect(element().querySelector(".stat .value")?.textContent?.trim()).toBe("0.7")
  })

  it("tells when the player has no stats for the season", () => {
    playerService.findPlayerStats.and.returnValue(throwError(() => new Error("404")))

    render()

    expect(element().querySelector(".empty-state")?.textContent).toContain("pas de stats sur cette saison")
  })

  it("shows an error instead of loading forever when the seasons cannot be loaded", () => {
    TestBed.overrideProvider(SeasonService, { useValue: { findAllSeasons: () => throwError(() => new Error("500")) } })

    render()

    expect(element().querySelector(".error-message")?.textContent).toContain("Impossible de charger les saisons")
    expect(playerService.findPlayerStats).not.toHaveBeenCalled()
  })

  it("updates the URL when another season is chosen", () => {
    render()
    const navigate = spyOn(TestBed.inject(Router), "navigate").and.resolveTo(true)

    const select = element().querySelector<HTMLSelectElement>("#season")!
    select.value = select.options[1].value
    select.dispatchEvent(new Event("change"))

    expect(navigate.calls.mostRecent().args[1]?.queryParams).toEqual({ season: 2024 })
  })
})

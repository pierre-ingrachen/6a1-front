import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { ActivatedRoute, convertToParamMap, Params, Router } from "@angular/router"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { of, throwError } from "rxjs"
import { PlayerCompareComponent } from "compare/player-compare/player-compare.component"
import { MatIconModule } from "@angular/material/icon"
import { PlayerPickerComponent } from "compare/player-picker/player-picker.component"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { StatRowComponent } from "compare/stat-row/stat-row.component"
import { SeasonService } from "services/season.service"
import { PlayerService } from "services/player.service"
import { PlayerStat, PlayerStats, StatValue } from "models/player-stats.model"

const value = (amount: number | null, percentile: number | null = null): StatValue => ({
  value: amount,
  percentile,
  topPercent: percentile === null ? null : Math.max(1, 100 - percentile),
})

const stat = (key: string, total: StatValue, per90: StatValue, options: Partial<PlayerStat> = {}): PlayerStat => ({
  key,
  label: key,
  detail: false,
  lowerIsBetter: false,
  total,
  per90,
  ...options,
})

const player = (id: number, name: string, stats: { goals: number; per90Goals: number; yellowCards: number; penalties: number | null }): PlayerStats => ({
  id,
  name,
  position: "Forward",
  heightCm: 180,
  weightKg: null,
  teamName: `Team ${id}`,
  teamEstimated: id === 2,
  rating: 90,
  averageRating: 7.5,
  minutes: 900,
  categories: [
    {
      key: "GOALS",
      label: "Buts",
      stats: [
        stat("Buts", value(stats.goals, 90), value(stats.per90Goals, 80)),
        stat("Penaltys", value(stats.penalties, 50), value(stats.penalties, 50)),
        stat("De la tête", value(1), value(0.1), { detail: true }),
      ],
    },
    {
      key: "DISCIPLINE",
      label: "Discipline",
      stats: [stat("Cartons jaunes", value(stats.yellowCards), value(stats.yellowCards), { lowerIsBetter: true })],
    },
    {
      key: "GOALKEEPING",
      label: "Gardien",
      stats: [stat("Arrêts", value(null), value(null))],
    },
  ],
})

describe("PlayerCompareComponent", () => {
  const players: Record<number, PlayerStats> = {
    1: player(1, "Kylian Mbappé", { goals: 6, per90Goals: 1.5, yellowCards: 3, penalties: 2 }),
    2: player(2, "Erling Haaland", { goals: 4, per90Goals: 1.8, yellowCards: 1, penalties: null }),
  }
  let router: jasmine.SpyObj<Router>
  let playerService: jasmine.SpyObj<PlayerService>
  let fixture: ComponentFixture<PlayerCompareComponent>

  const element = (): HTMLElement => fixture.nativeElement
  const rowNamed = (label: string): HTMLElement =>
    Array.from(element().querySelectorAll<HTMLElement>("stat-row")).find(
      (row) => row.querySelector(".label")?.textContent?.trim() === label,
    )!
  const sideValues = (label: string) =>
    Array.from(rowNamed(label).querySelectorAll(".value")).map((side) => side.textContent?.trim())

  const render = (params: Params) => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { queryParamMap: of(convertToParamMap(params)) } })
    fixture = TestBed.createComponent(PlayerCompareComponent)
    fixture.detectChanges()
  }

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>("Router", ["navigate"])
    playerService = jasmine.createSpyObj<PlayerService>("PlayerService", ["findPlayerStats", "searchPlayers"])
    playerService.findPlayerStats.and.callFake((playerId) =>
      players[playerId] ? of(players[playerId]) : throwError(() => new Error("404")),
    )
    playerService.searchPlayers.and.returnValue(of([]))

    TestBed.configureTestingModule({
      declarations: [PlayerCompareComponent, PlayerPickerComponent, PlayerSearchComponent, StatRowComponent],
      imports: [FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatButtonToggleModule, MatIconModule, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
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

  it("restores both players and their own season from the URL", () => {
    render({ p1: "1", s1: "2024", p2: "2", s2: "2025" })

    expect(playerService.findPlayerStats).toHaveBeenCalledWith(1, 2024)
    expect(playerService.findPlayerStats).toHaveBeenCalledWith(2, 2025)
    expect(router.navigate).not.toHaveBeenCalled()
    const names = Array.from(element().querySelectorAll(".player-header h2")).map((title) => title.textContent)
    expect(names).toEqual(["Kylian Mbappé", "Erling Haaland"])
    expect(element().querySelectorAll(".estimated").length).toBe(1)
  })

  it("selects the latest season the player actually played when chosen", () => {
    render({})

    fixture.componentInstance.selectFirstPlayer({ id: 1, name: "Kylian Mbappé", position: "Forward", teamName: "PSG", seasons: [{ startYear: 2025, teamName: "PSG" }, { startYear: 2024, teamName: "PSG" }] })
    fixture.componentInstance.selectSecondPlayer({ id: 2, name: "Erling Haaland", position: "Forward", teamName: "City", seasons: [{ startYear: 2024, teamName: "City" }] })

    const urlUpdates = router.navigate.calls.allArgs().map(([, extras]) => extras?.queryParams)
    expect(urlUpdates).toEqual([
      { p1: 1, s1: 2025 },
      { p2: 2, s2: 2024 },
    ])
  })

  it("changes the season of one player only", () => {
    render({ p1: "1", s1: "2025", p2: "2", s2: "2025" })

    fixture.componentInstance.selectSecondSeason(2024)

    const urlUpdates = router.navigate.calls.allArgs().map(([, extras]) => extras?.queryParams)
    expect(urlUpdates).toEqual([{ s2: 2024 }])
  })

  it("switches every value between totals and per 90 minutes", () => {
    render({ p1: "1", s1: "2025", p2: "2", s2: "2025" })
    expect(sideValues("Buts")).toEqual(["6", "4"])

    element().querySelectorAll<HTMLButtonElement>("mat-button-toggle button")[1].click()
    fixture.detectChanges()

    expect(sideValues("Buts")).toEqual(["1.5", "1.8"])
  })

  it("highlights the best player on each row, including when lower is better", () => {
    render({ p1: "1", s1: "2025", p2: "2", s2: "2025" })

    expect(rowNamed("Buts").querySelector(".best")?.classList).toContain("first")
    expect(rowNamed("Cartons jaunes").querySelector(".best")?.classList).toContain("second")
  })

  it("displays a dash without bar for null values", () => {
    render({ p1: "1", s1: "2025", p2: "2", s2: "2025" })

    expect(sideValues("Penaltys")).toEqual(["2", "—"])
    expect(rowNamed("Penaltys").querySelector(".second .bar")).toBeNull()
    expect(rowNamed("Penaltys").querySelector(".first .bar")).not.toBeNull()
    expect(rowNamed("Penaltys").querySelector(".best")).toBeNull()
  })

  it("puts breakdowns in a collapsed details section and hides empty categories", () => {
    render({ p1: "1", s1: "2025", p2: "2", s2: "2025" })

    const details = element().querySelector("details")!
    expect(details.open).toBeFalse()
    expect(details.textContent).toContain("De la tête")
    const categoryTitles = Array.from(element().querySelectorAll(".category h3")).map((title) => title.textContent)
    expect(categoryTitles).toEqual(["Buts", "Discipline"])
  })

  it("tells when a player has no stats in the selected season", () => {
    render({ p1: "1", s1: "2025", p2: "99", s2: "2025" })

    expect(element().querySelector(".missing")?.textContent).toContain("pas de stats sur la saison choisie")
  })
})

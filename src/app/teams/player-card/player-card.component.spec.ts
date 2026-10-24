import { ComponentFixture, TestBed } from "@angular/core/testing"
import { provideRouter } from "@angular/router"
import { PlayerCardComponent } from "teams/player-card/player-card.component"
import { Player } from "models/player.model"

describe("PlayerCardComponent", () => {
  const player: Player = { id: 7, name: "Bukayo Saka", position: "Forward", goals: 5, assists: null, averageRating: 7.3, rating: 88, matchesPlayed: 8 }
  let fixture: ComponentFixture<PlayerCardComponent>

  const element = (): HTMLElement => fixture.nativeElement
  const render = (value: Player, season: number | null = 2025) => {
    fixture = TestBed.createComponent(PlayerCardComponent)
    fixture.componentRef.setInput("player", value)
    fixture.componentRef.setInput("season", season)
    fixture.detectChanges()
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [PlayerCardComponent], providers: [provideRouter([])] }))

  it("shows the player summary with a translated position", () => {
    render(player)

    expect(element().querySelector("h2")?.textContent?.trim()).toBe("Bukayo Saka")
    expect(element().querySelector(".position")?.textContent?.trim()).toBe("Attaquant")
    expect(Array.from(element().querySelectorAll(".player-detail strong")).map((v) => v.textContent?.trim())).toEqual(["8", "88/99", "5", "—"])
    expect(element().querySelector(".rating-badge")?.textContent?.trim()).toBe("7.30")
    expect(element().querySelector(".rating-badge")?.classList).toContain("rating-outstanding")
  })

  it("shows placeholders for missing values", () => {
    render({ ...player, averageRating: null, rating: null, goals: null })

    expect(element().querySelector(".rating-badge")?.textContent?.trim()).toBe("—")
    expect(Array.from(element().querySelectorAll(".player-detail strong")).map((v) => v.textContent?.trim())).toEqual(["8", "—", "—", "—"])
  })

  it("links to the player profile for the given season", () => {
    render(player, 2024)

    expect(element().querySelector("a")?.getAttribute("href")).toBe("/joueurs/7?season=2024")
  })
})

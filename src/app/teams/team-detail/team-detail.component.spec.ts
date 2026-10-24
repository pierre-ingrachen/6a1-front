import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, convertToParamMap, provideRouter, RouterLink } from "@angular/router"
import { of, throwError } from "rxjs"
import { TeamDetailComponent } from "teams/team-detail/team-detail.component"
import { TeamService } from "services/team.service"
import { Player } from "models/player.model"

describe("TeamDetailComponent", () => {
  const playersBySeason: Record<number, Player[]> = {
    2025: [{ id: 1, name: "Bukayo Saka", position: "Forward", goals: 5, assists: null, averageRating: 7.3, rating: 88, matchesPlayed: 8 }],
    2024: [{ id: 2, name: "Declan Rice", position: "Midfielder", goals: 0, assists: 2, averageRating: null, rating: null, matchesPlayed: 8 }],
  }
  let teamService: jasmine.SpyObj<TeamService>
  let fixture: ComponentFixture<TeamDetailComponent>

  const element = (): HTMLElement => fixture.nativeElement
  const select = (): HTMLSelectElement => element().querySelector("select")!
  const playerCells = () =>
    Array.from(element().querySelectorAll<HTMLElement>(".player-card")).map((card) => [
      card.querySelector("h2")?.textContent?.trim(),
      card.querySelector(".position")?.textContent?.trim(),
      ...Array.from(card.querySelectorAll(".player-detail strong")).map((v) => v.textContent?.trim()),
      card.querySelector(".rating-badge")?.textContent?.trim(),
      card.querySelector(".rating-badge")?.className.match(/rating-(\w+)$/)?.[1],
    ])

  const render = () => {
    fixture = TestBed.createComponent(TeamDetailComponent)
    fixture.detectChanges()
    tick()
    fixture.detectChanges()
  }

  beforeEach(() => {
    teamService = jasmine.createSpyObj<TeamService>("TeamService", [
      "findTeamById",
      "findSeasonsByTeam",
      "findPlayersByTeam",
    ])
    teamService.findTeamById.and.returnValue(of({ id: 13, name: "Arsenal", country: "England" }))
    teamService.findSeasonsByTeam.and.returnValue(
      of([
        { startYear: 2025, label: "2025/2026" },
        { startYear: 2024, label: "2024/2025" },
      ]),
    )
    teamService.findPlayersByTeam.and.callFake((teamId, season) => of(playersBySeason[season]))

    TestBed.configureTestingModule({
      imports: [TeamDetailComponent],
      providers: [
        provideRouter([]),
        { provide: TeamService, useValue: teamService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ teamId: "13" }) } } },
      ],
    })
  })

  it("displays the team name and country", fakeAsync(() => {
    render()

    expect(teamService.findTeamById).toHaveBeenCalledOnceWith(13)
    expect(element().querySelector("h1")?.textContent).toBe("Arsenal")
    expect(element().querySelector(".country")?.textContent).toBe("England")
  }))

  it("selects the most recent season by default and displays its squad", fakeAsync(() => {
    render()

    expect(select().selectedOptions[0].textContent?.trim()).toBe("2025/2026")
    expect(teamService.findPlayersByTeam).toHaveBeenCalledOnceWith(13, 2025)
    expect(playerCells()).toEqual([["Bukayo Saka", "Attaquant", "8", "88/99", "5", "—", "7.30", "outstanding"]])
  }))

  it("reloads the squad when another season is selected", fakeAsync(() => {
    render()

    select().value = select().options[1].value
    select().dispatchEvent(new Event("change"))
    fixture.detectChanges()

    expect(teamService.findPlayersByTeam).toHaveBeenCalledTimes(2)
    expect(teamService.findPlayersByTeam).toHaveBeenCalledWith(13, 2024)
    expect(playerCells()).toEqual([["Declan Rice", "Milieu", "8", "—", "0", "2", "—", "none"]])
  }))

  it("reorders the squad when the sort select changes", fakeAsync(() => {
    teamService.findPlayersByTeam.and.returnValue(
      of([
        { id: 1, name: "Bukayo Saka", position: "Forward", goals: 5, assists: 1, averageRating: 7.3, rating: 88, matchesPlayed: 8 },
        { id: 2, name: "Declan Rice", position: "Midfielder", goals: 9, assists: 2, averageRating: 6.9, rating: 85, matchesPlayed: 8 },
      ]),
    )
    render()
    const names = () => Array.from(element().querySelectorAll(".player-card h2")).map((h) => h.textContent?.trim())
    expect(names()).toEqual(["Bukayo Saka", "Declan Rice"])

    const sort = element().querySelector<HTMLSelectElement>("#sort")!
    sort.selectedIndex = 2
    sort.dispatchEvent(new Event("change"))
    fixture.detectChanges()
    tick()
    fixture.detectChanges()

    expect(names()).toEqual(["Declan Rice", "Bukayo Saka"])
  }))

  it("reverses the squad when the direction select changes", fakeAsync(() => {
    teamService.findPlayersByTeam.and.returnValue(
      of([
        { id: 1, name: "Bukayo Saka", position: "Forward", goals: 5, assists: 1, averageRating: 7.3, rating: 88, matchesPlayed: 8 },
        { id: 2, name: "Declan Rice", position: "Midfielder", goals: 9, assists: 2, averageRating: 6.9, rating: 85, matchesPlayed: 8 },
      ]),
    )
    render()
    const names = () => Array.from(element().querySelectorAll(".player-card h2")).map((h) => h.textContent?.trim())
    expect(names()).toEqual(["Bukayo Saka", "Declan Rice"])

    const direction = element().querySelector<HTMLSelectElement>("#sort-direction")!
    direction.selectedIndex = 0
    direction.dispatchEvent(new Event("change"))
    fixture.detectChanges()
    tick()
    fixture.detectChanges()

    expect(names()).toEqual(["Declan Rice", "Bukayo Saka"])
  }))

  it("links each card to the player profile of the selected season without compact style", fakeAsync(() => {
    render()

    const card = element().querySelector<HTMLAnchorElement>(".player-card")!
    expect(card.getAttribute("href")).toBe("/joueurs/1?season=2025")
    expect(card.classList).not.toContain("compact")
  }))

  it("shows an error when the squad cannot be loaded and recovers on another season", fakeAsync(() => {
    teamService.findPlayersByTeam.and.returnValues(
      throwError(() => new Error("500")),
      of(playersBySeason[2024]),
    )
    render()
    expect(element().querySelector(".error-message")?.textContent).toContain("Impossible de charger les joueurs")
    expect(element().querySelector(".player-card")).toBeNull()

    select().value = select().options[1].value
    select().dispatchEvent(new Event("change"))
    fixture.detectChanges()
    tick()
    fixture.detectChanges()

    expect(element().querySelector(".error-message")).toBeNull()
    expect(playerCells()).toEqual([["Declan Rice", "Milieu", "8", "—", "0", "2", "—", "none"]])
  }))

  it("displays a message when the team does not exist", fakeAsync(() => {
    teamService.findTeamById.and.returnValue(throwError(() => new Error("404")))
    teamService.findSeasonsByTeam.and.returnValue(throwError(() => new Error("404")))

    render()

    expect(element().querySelector(".not-found")?.textContent).toBe("Équipe introuvable")
    expect(teamService.findPlayersByTeam).not.toHaveBeenCalled()
  }))
})

import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, convertToParamMap, provideRouter, RouterLink } from "@angular/router"
import { of, throwError } from "rxjs"
import { TeamDetailComponent } from "teams/team-detail/team-detail.component"
import { TeamService } from "services/team.service"
import { Player } from "models/player.model"

describe("TeamDetailComponent", () => {
  const playersBySeason: Record<number, Player[]> = {
    2025: [{ id: 1, name: "Bukayo Saka", position: "Forward", goals: 5, assists: null, averageRating: 7.3, matchesPlayed: 8 }],
    2024: [{ id: 2, name: "Declan Rice", position: "Midfielder", goals: 0, assists: 2, averageRating: null, matchesPlayed: 8 }],
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
      declarations: [TeamDetailComponent],
      imports: [FormsModule, RouterLink],
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
    expect(playerCells()).toEqual([["Bukayo Saka", "Forward", "8", "5", "—", "7.30", "outstanding"]])
  }))

  it("reloads the squad when another season is selected", fakeAsync(() => {
    render()

    select().value = select().options[1].value
    select().dispatchEvent(new Event("change"))
    fixture.detectChanges()

    expect(teamService.findPlayersByTeam).toHaveBeenCalledTimes(2)
    expect(teamService.findPlayersByTeam).toHaveBeenCalledWith(13, 2024)
    expect(playerCells()).toEqual([["Declan Rice", "Midfielder", "8", "0", "2", "—", "none"]])
  }))

  it("displays a message when the team does not exist", fakeAsync(() => {
    teamService.findTeamById.and.returnValue(throwError(() => new Error("404")))
    teamService.findSeasonsByTeam.and.returnValue(throwError(() => new Error("404")))

    render()

    expect(element().querySelector(".not-found")?.textContent).toBe("Équipe introuvable")
    expect(teamService.findPlayersByTeam).not.toHaveBeenCalled()
  }))
})

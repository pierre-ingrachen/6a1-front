import { FormsModule } from "@angular/forms"
import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { TeamListComponent } from "teams/team-list/team-list.component"
import { TeamService } from "services/team.service"

describe("TeamListComponent", () => {
  let teamService: jasmine.SpyObj<TeamService>

  beforeEach(() => {
    teamService = jasmine.createSpyObj<TeamService>("TeamService", [
      "findAllTeams",
      "findSeasonsByTeam",
      "findPlayersByTeam",
    ])
    teamService.findAllTeams.and.returnValue(
      of([
        { id: 13, name: "Arsenal", country: "England" },
        { id: 37, name: "Bayern", country: "Germany" },
      ]),
    )
    teamService.findSeasonsByTeam.and.returnValue(
      of([
        { startYear: 2025, label: "2025/26" },
        { startYear: 2024, label: "2024/25" },
      ]),
    )
    teamService.findPlayersByTeam.and.returnValue(
      of([
        {
          id: 1,
          name: "Alex Martin",
          position: "Attaquant",
          goals: 4,
          assists: 1,
          averageRating: 6.72,
        },
      ]),
    )

    TestBed.configureTestingModule({
      declarations: [TeamListComponent],
      imports: [FormsModule],
      providers: [{ provide: TeamService, useValue: teamService }],
    })
  })

  it("filters teams by search and loads player cards after selecting a result", () => {
    const fixture = TestBed.createComponent(TeamListComponent)
    fixture.detectChanges()

    const search = fixture.nativeElement.querySelector("#team")
    search.value = "bay"
    search.dispatchEvent(new Event("input"))
    fixture.detectChanges()

    const results = fixture.nativeElement.querySelectorAll(".team-options button")
    expect(results.length).toBe(1)
    expect(results[0].textContent).toContain("Bayern")

    fixture.componentInstance.selectTeam(37)
    fixture.detectChanges()

    const seasonSelector = fixture.nativeElement.querySelector("#season")
    const cards = fixture.nativeElement.querySelectorAll(".player-card")

    expect(seasonSelector).not.toBeNull()
    expect(cards.length).toBe(1)
    expect(cards[0].textContent).toContain("Alex Martin")
    expect(teamService.findPlayersByTeam).toHaveBeenCalledWith(37, 2025)
  })

  it("loads seasons and players when a searched team is selected", () => {
    const fixture = TestBed.createComponent(TeamListComponent)
    fixture.detectChanges()

    fixture.componentInstance.selectTeam(37)
    fixture.detectChanges()

    expect(teamService.findSeasonsByTeam).toHaveBeenCalledWith(37)
    expect(teamService.findPlayersByTeam).toHaveBeenCalledWith(37, 2025)
    expect(fixture.nativeElement.querySelector(".player-card").textContent).toContain("Alex Martin")
  })
})

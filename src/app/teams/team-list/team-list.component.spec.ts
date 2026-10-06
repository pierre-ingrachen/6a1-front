import { TestBed } from "@angular/core/testing"
import { provideRouter, Router, RouterLink } from "@angular/router"
import { of } from "rxjs"
import { TeamListComponent } from "teams/team-list/team-list.component"
import { TeamService } from "services/team.service"

describe("TeamListComponent", () => {
  const renderRows = (): HTMLTableRowElement[] => {
    const fixture = TestBed.createComponent(TeamListComponent)
    fixture.detectChanges()
    return Array.from(fixture.nativeElement.querySelectorAll("tbody tr"))
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamListComponent],
      imports: [RouterLink],
      providers: [
        provideRouter([]),
        {
          provide: TeamService,
          useValue: {
            findAllTeams: () =>
              of([
                { id: 13, name: "Arsenal", country: "England" },
                { id: 37, name: "Bayern", country: "Germany" },
              ]),
          },
        },
      ],
    })
  })

  it("renders one row per team", () => {
    const cells = renderRows().map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim()))

    expect(cells).toEqual([
      ["Arsenal", "England"],
      ["Bayern", "Germany"],
    ])
  })

  it("navigates to the team detail page when a team is clicked", () => {
    const router = TestBed.inject(Router)
    const navigateByUrl = spyOn(router, "navigateByUrl")

    renderRows()[1].click()

    expect(navigateByUrl.calls.mostRecent().args[0].toString()).toBe("/teams/37")
  })
})

import { ComponentFixture, TestBed } from "@angular/core/testing"
import { GroupTableComponent } from "game/group-table/group-table.component"
import { GroupStanding } from "game/models/competition.model"

describe("GroupTableComponent", () => {
  const standing = (goalDifference: number): GroupStanding => ({
    teamName: "Your team",
    seasonLabel: "",
    player: true,
    played: 6,
    wins: 4,
    draws: 1,
    losses: 1,
    goalsFor: 10,
    goalsAgainst: 10 - goalDifference,
    points: 13,
    goalDifference,
  })
  let fixture: ComponentFixture<GroupTableComponent>

  const goalDifferenceCell = (): string | undefined =>
    fixture.nativeElement.querySelectorAll("tbody td")[6]?.textContent?.trim()

  const render = (standings: GroupStanding[]) => {
    fixture = TestBed.createComponent(GroupTableComponent)
    fixture.componentRef.setInput("standings", standings)
    fixture.detectChanges()
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [GroupTableComponent] }))

  it("prefixes a positive goal difference with a plus sign", () => {
    render([standing(5)])

    expect(goalDifferenceCell()).toBe("+5")
  })

  it("shows a negative goal difference as is", () => {
    render([standing(-3)])

    expect(goalDifferenceCell()).toBe("-3")
  })
})
